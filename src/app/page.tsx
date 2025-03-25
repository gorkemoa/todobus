"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-16 md:mb-0">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-800 drop-shadow-xl">
                Proje yönetiminde <span className="text-indigo-600">mükemmelliğe</span> ulaşın
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-gray-600 leading-relaxed">
                Zarif ve sezgisel arayüz ile projenizi hiç olmadığı kadar etkili yönetin
              </p>
              <div className="flex flex-wrap gap-6">
                <Link
                  href="/giris"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 font-medium py-4 px-10 rounded-full transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center"
                >
                  <span>Giriş Yap</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/kayit"
                  className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-4 px-10 rounded-full transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <span>Kayıt Ol</span>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-[500px] transform transition-all duration-1000 hover:rotate-3 hover:scale-105">
                <div className="absolute w-full h-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 transform -rotate-3 -translate-y-2 translate-x-2 opacity-30"></div>
                <div className="absolute w-full h-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 transform -rotate-1 translate-y-1 -translate-x-1 opacity-20"></div>
                <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-700">
                  <Image 
                    src="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80" 
                    alt="TodoBus Dashboard" 
                    fill 
                    style={{objectFit: "contain"}}
                    className="rounded-2xl shadow-lg transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>




      {/* Neden TodoBus Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-indigo-100 opacity-50 z-0"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-800">Neden TodoBus?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Zarafet ve işlevselliği bir araya getiren, modern bir proje yönetim deneyimi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                img: "https://images.unsplash.com/photo-1483389127117-b6a2102724ae?auto=format&fit=crop&q=80",
                title: "Zamanı Etkin Kullanın",
                desc: "Minimal arayüz ile görev süreçlerinizi optimize edin. İleri planlama fonksiyonları ile zaman yönetiminde mükemmelliği yakalayın."
              },
              {
                img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80",
                title: "Kusursuz İşbirliği",
                desc: "Ekibinizle gerçek zamanlı iletişim. Modern işbirliği araçlarıyla projelerinizi sorunsuz tamamlayın."
              },
              {
                img: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80",
                title: "Güçlü Analizler",
                desc: "Detaylı analizler ve görselleştirmelerle verilere dayalı kararlar alın. Proje performansınızı anlık olarak izleyin."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2">
                <div className="relative h-56">
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill 
                    style={{objectFit: "cover"}}
                    className="transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                </div>
                <div className="p-8 border border-gray-100 border-t-0 rounded-b-xl">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-16 md:mb-0 md:pr-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-gray-800">Zarif Kullanıcı Arayüzü</h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Her detayı düşünülmüş, minimal ve şık bir kullanıcı deneyimi. TodoBus&apos;ın kusursuz arayüzü ile projelerinizi yönetmek hiç bu kadar kolay olmamıştı.
              </p>
              <ul className="space-y-6">
                {[
                  "Kişiselleştirilebilir gösterge panelleri",
                  "Gelişmiş sürükle-bırak arayüzü",
                  "Akıllı filtreleme ve gruplama"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-[600px] perspective-1000">
                <div className="absolute w-full h-full transform-style-3d transform rotate-y-6 rotate-x-3 group hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 rounded-2xl transform translate-z-m20"></div>
                  <div className="absolute inset-4 bg-white rounded-xl shadow-2xl transform translate-z-0 overflow-hidden">
                    <Image 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
                      alt="TodoBus Arayüzü" 
                      fill 
                      style={{objectFit: "cover"}}
                      className="transition-all duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Grid */}
      <section className="py-32 bg-gradient-to-b from-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -right-[10%] -top-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-b from-blue-100 to-indigo-100 mix-blend-multiply opacity-60 transform rotate-12 animate-pulse"></div>
          <div className="absolute -left-[5%] top-[30%] w-[25%] h-[25%] rounded-full bg-gradient-to-tl from-indigo-100 to-purple-100 mix-blend-multiply opacity-50 animate-pulse animation-delay-2000"></div>
          <div className="absolute right-[20%] bottom-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-purple-100 to-blue-100 mix-blend-multiply opacity-40 animate-pulse animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-800">Premium Özellikler</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Üstün fonksiyonellik ve estetik tasarım ile fark yaratın
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/todo-list--v1.png",
                title: "Gelişmiş Görev Yönetimi",
                desc: "Sezgisel arayüz ile görevleri kategorilere ayırın, önceliklendirin ve zamanında tamamlayın."
              },
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/calendar--v1.png",
                title: "Akıllı Takvim",
                desc: "Otomatik zamanlama ve hatırlatıcılar ile tüm projeleri sorunsuz bir şekilde planlayın."
              },
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/conference-call--v1.png",
                title: "Ekip İşbirliği",
                desc: "Gelişmiş işbirliği araçları ile ekip çalışmasını yeni bir seviyeye taşıyın."
              },
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/statistics--v1.png",
                title: "Detaylı Analizler",
                desc: "Şık grafikler ve raporlarla proje performansını anlık olarak takip edin."
              },
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/cloud-sync--v1.png",
                title: "Bulut Entegrasyonu",
                desc: "Tüm cihazlarınızda senkronize çalışın, verilerin güvenliği konusunda endişelenmeyin."
              },
              {
                icon: "https://img.icons8.com/ios/100/4F46E5/api-settings--v1.png",
                title: "API Erişimi",
                desc: "Güçlü API ile kendi iş akışınızı oluşturun ve diğer araçlarla sorunsuz entegrasyon sağlayın."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                  <Image src={item.icon} alt={item.title} width={64} height={64} className="opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Müşteri Yorumları Carousel */}
      <section className="py-32 bg-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-blue-100 opacity-50"></div>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-5"
          >
            <source src="/testimonial-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-800">Kullanıcı Deneyimleri</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              TodoBus&apos;ın sunduğu premium deneyim hakkında neler söylüyorlar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
                name: "Ayşe Yılmaz",
                role: "Kreatif Direktör, TechVision",
                text: "TodoBus, projelerimizi yönetme şeklimizi tamamen değiştirdi. Minimal ve şık arayüzü ile çalışmak bir zevk."
              },
              {
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
                name: "Mehmet Kaya",
                role: "CEO, DigitalEdge",
                text: "Ekip verimliliğimiz %60 arttı. TodoBus&apos;ın sunduğu detaylı analizler sayesinde kaynaklarımızı çok daha etkili kullanıyoruz."
              },
              {
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
                name: "Deniz Arslan",
                role: "Proje Yöneticisi, InnoTech",
                text: "Profesyonel görünümü ve kolay kullanımı ile şimdiye kadar kullandığım en iyi proje yönetim aracı."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute -top-2 -left-2 text-indigo-200 text-8xl opacity-20">&ldquo;</div>
                <p className="text-gray-700 italic mb-8 leading-relaxed text-lg relative z-10">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center">
                  <div className="relative w-14 h-14 mr-4 rounded-full overflow-hidden ring-2 ring-indigo-100">
                    <Image 
                      src={item.img} 
                      alt={item.name} 
                      fill 
                      style={{objectFit: "cover"}}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-indigo-500 text-sm">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Abonelik Planları */}
      <section className="py-32 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50 to-white z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-800">Premium Planlar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              İhtiyaçlarınıza özel tasarlanmış abonelik seçenekleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Essential",
                price: "Ücretsiz",
                features: ["3 kullanıcıya kadar", "Temel proje yönetimi", "Email desteği", "Sınırlı depolama"],
                cta: "Başlayın",
                popular: false
              },
              {
                title: "Professional",
                price: "₺199/ay",
                features: ["20 kullanıcıya kadar", "Gelişmiş özellikler", "Öncelikli destek", "Sınırsız depolama", "API erişimi"],
                cta: "Hemen Katılın",
                popular: true
              },
              {
                title: "Enterprise",
                price: "₺499/ay",
                features: ["Sınırsız kullanıcı", "Tüm premium özellikler", "7/24 özel destek", "Gelişmiş güvenlik", "Özel entegrasyonlar", "Kişiselleştirme"],
                cta: "İletişime Geçin",
                popular: false
              }
            ].map((plan, idx) => (
              <div key={idx} className={`bg-white rounded-xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 shadow-lg ${plan.popular ? 'ring-2 ring-indigo-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="bg-indigo-600 text-white py-1 px-4 absolute top-0 right-0 text-sm font-medium">
                    Önerilen
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{plan.title}</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/kayit"
                    className={`w-full block text-center py-4 px-6 rounded-lg font-medium transition-all duration-500 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-indigo-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/cta-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-80"></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-white">Premium Deneyimi Keşfedin</h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Hiçbir kredi kartı gerekmeden, 14 gün boyunca TodoBus&apos;ın tüm premium özelliklerini deneyin.
          </p>
          <Link
            href="/kayit"
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium py-5 px-12 rounded-full text-lg transition-all duration-500 inline-flex items-center group shadow-xl hover:shadow-2xl"
          >
            <span>Ücretsiz Demo İsteyin</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <p className="mt-6 text-indigo-200">Taahhüt yok. İstediğiniz zaman iptal edebilirsiniz.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-20 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-indigo-600">TodoBus</h3>
              <p className="text-gray-600 leading-relaxed">
                Minimal tasarım, maksimum verimlilik için geliştirilmiş premium proje yönetim platformu.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-gray-700">Ürün</h4>
              <ul className="space-y-4">
                {["Özellikler", "Fiyatlandırma", "Kullanım Örnekleri", "Güvenlik", "Entegrasyonlar"].map((item, idx) => (
                  <li key={idx}>
                    <Link href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-gray-700">Şirket</h4>
              <ul className="space-y-4">
                {["Hakkımızda", "Kariyer", "Blog", "Basın", "İletişim"].map((item, idx) => (
                  <li key={idx}>
                    <Link href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-gray-700">Destek</h4>
              <ul className="space-y-4">
                {["Yardım Merkezi", "Dokümantasyon", "Eğitimler", "Topluluk", "Durum Sayfası"].map((item, idx) => (
                  <li key={idx}>
                    <Link href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-6 md:mb-0">
              &copy; {new Date().getFullYear()} TodoBus. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6">
              {["facebook", "twitter", "linkedin", "instagram"].map((social, idx) => (
                <Link href="#" key={idx} className="text-gray-400 hover:text-indigo-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Özel animasyon stilleri */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-6 {
          transform: rotateY(6deg);
        }
        .rotate-x-3 {
          transform: rotateX(3deg);
        }
        .hover\:rotate-y-0:hover {
          transform: rotateY(0deg);
        }
        .hover\:rotate-x-0:hover {
          transform: rotateX(0deg);
        }
        .translate-z-m20 {
          transform: translateZ(-20px);
        }
        .translate-z-0 {
          transform: translateZ(0);
        }
      `}</style>
    </main>
  );
}
