import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  // El middleware ya protege esta ruta, pero verificamos session para el tipado de TS
  if (!session) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de Control</h1>
          <span className="px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
            Usuario Autenticado
          </span>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-4 text-center">
              Información del Perfil
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Nombre</p>
                <p className="text-lg text-gray-800">{session.user?.name || "Usuario del Concesionario"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Correo Electrónico</p>
                <p className="text-lg text-gray-800">{session.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-[0.98]"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}