// Next-Auth konfigürasyonunu aktarıyoruz
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Tüm auth ile ilgili yapılandırmaları tek bir noktadan yönetmek için bu modülü kullanıyoruz
export { authOptions }; 