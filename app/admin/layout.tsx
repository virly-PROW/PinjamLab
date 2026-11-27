import Link from "next/link";
import {logout} from "@/app/login/action";
import  {requireAdmin} from "@/lib/sesi";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
    await requireAdmin();

        return (
            <div> 
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 px-4 py-2 text-white">
                <div className="flex items-center gap-5">
                    <span className="font-semibold">Panel Admin</span>
                    <Link href="/admin" className="text-sm hover:underline">
                        Permohonan
                    </Link>
                    <Link href="/admin/ruang" className="text-sm hover:underline">
                        Ruang
                    </Link>
                </div>
                <form action={logout}>
                    <button className="text-sm underline">Keluar</button>
                </form>
            </div>
            {children}
        </div>
        
    );   
}
