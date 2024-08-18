"use server";

import {
  createUser,
  findUser,
  removeUser,
  updateUser,
} from "@/database/user.query";
import { generateHash } from "@/lib/encryption";
import { getServerSession } from "@/lib/next-auth";
import { ServerActionResponse } from "@/types/action";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertUser(
  id: string | undefined | null,
  data: { email?: string; name?: string; role?: Role; password?: string },
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    const currentUserRole = session?.user?.role;

    if (data.role && currentUserRole !== "SUPERADMIN")
      return { success: false, message: "Forbidden" };

    if (!id) {
      const { email, name, role, password } = data;
      if (!email || !name || !role || !password)
        return { success: false, message: "Bad request" };

      const checkEmailExistence = await findUser({ email });
      if (checkEmailExistence) return { success: false, message: "Forbidden" };

      await createUser({
        email,
        name,
        role,
        password: generateHash(password),
      });

      return { success: true, message: "Sukses membuat user!" };
    }

    const userToUpdate = await findUser({ id });
    if (!userToUpdate)
      return { success: false, message: "User tidak ditemukan!" };

    await updateUser({ id }, data);

    revalidatePath("/admin/user");
    return { success: true, message: "Sukses meng-update user!" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error" };
  }
}

export async function deleteUser(id: string): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (session?.user?.role !== "SUPERADMIN")
      return { success: false, message: "Forbidden" };

    const userToDelete = await findUser({ id });
    if (!userToDelete)
      return { success: false, message: "User tidak ditemukan!" };

    await removeUser({ id });

    return { success: true, message: "Berhasil menghapus user!" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Terjadi kesalahan!" };
  }
}