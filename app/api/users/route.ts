import { connectToDatabase } from "@/lib/mongo"
import bcrypt from "bcryptjs"
import Fuse from "fuse.js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * GET /api/users
 * Obtiene la lista de usuarios
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let users: {
      id: string;
      name: string;
      email: string;
      role: string;
      password: string;
      createdAt: string;
    }[]

    // Solo trae usuarios donde `deleted` es `false` o no existe
    const db = await connectToDatabase();
    users = (await db.collection('users').find({ $or: [{ deleted: false }, { deleted: { $exists: false } }] }).toArray()).map((doc: any) => ({ 
      id: doc.id?.toString() ?? "",
      name: doc.name ?? "",
      email: doc.email ?? "",
      role: doc.role ?? "",
      password: doc.password ?? "",
      createdAt: doc.createdAt ?? "",
    }))

    let filteredUsers = users

    // Filtrar por término de búsqueda si existe
    if (search) {
      let fuse = new Fuse(filteredUsers, {
        keys: ["name", "email","role"],
        threshold: 0.25, // Ajusta la sensibilidad de la búsqueda
      })
      filteredUsers = fuse.search(search).map(result => result.item)
    }

    // Paginación simple
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json(
      {
        success: true,
        data: paginatedUsers,
        pagination: {
          total: filteredUsers.length,
          page,
          limit,
          pages: Math.ceil(filteredUsers.length / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener usuarios",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { name, email, password } = body

    // Validar campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos los campos son obligatorios",
        },
        { status: 400 },
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "El formato del email no es válido",
        },
        { status: 400 },
      )
    }

    // Simulación de creación de usuario
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: "Operador", // Rol por defecto
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString().split("T")[0],
    }

    const db = await connectToDatabase();
    await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "Usuario creado correctamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear usuario",
      },
      { status: 500 },
    )
  }
}
/**
 * PATCH /api/users
 * Elimina de manera lógica un usuario
 */
export async function PATCH(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { id } = body

    // Validar campos requeridos
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Falta el ID del usuario",
        },
        { status: 400 },
      )
    }

    const db = await connectToDatabase();
    const result = await db.collection('users').updateOne(
      { id: id },
      { $set: { deleted: true } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado o no se realizaron cambios",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado correctamente",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar usuario",
      },
      { status: 500 },
    )
  }
}