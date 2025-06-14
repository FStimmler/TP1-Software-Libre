import { connectToDatabase } from "@/lib/mongo"
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


    const db = await connectToDatabase();
    users = (await db.collection('users').find().toArray()).map((doc: any) => ({ 
      id: doc._id?.toString() ?? "",
      name: doc.name ?? "",
      email: doc.email ?? "",
      role: doc.role ?? "",
      password: doc.password ?? "",
      createdAt: doc.createdAt ?? "",
    }))

    // Filtrar por término de búsqueda si existe
    const filteredUsers = search
      ? users.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase()),
        )
      : users

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
      createdAt: new Date().toISOString().split("T")[0],
    }

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
