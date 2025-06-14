"use server"

import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { useEffect } from "react"

// Simulación de autenticación
//const VALID_EMAIL = "admin@ejemplo.com"
//const VALID_PASSWORD = "password"

async function loadUser(email: string) {
  const res = await fetch('http://localhost:3000/api/users?search='+email);
  const mockUser = await res.json();
  return mockUser.data[0] || null;
} 


export async function login(email: string, password: string) {
  const [userData] = await Promise.all([
    loadUser(email)
  ]);

  if (!userData) {
    throw new Error("Usuario no encontrado");
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, userData.password);
  } catch (error) {
    throw new Error("Error al verificar las credenciales");
  }

  if (isPasswordValid) {
    // Crear una sesión simple
    const session = {
      user: {
        email,
        name: "Administrador",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    } as any;

    // Guardar en cookies
    (await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });

    return session;
  }

  throw new Error("Credenciales inválidas");
}

export async function logout() {
  (await cookies()).delete("session")
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Verificar si la sesión ha expirado
    if (new Date(session.expires) < new Date()) {
      (await cookies()).delete("session")
      return null
    }

    return session
  } catch (error) {
    return null
  }
}
