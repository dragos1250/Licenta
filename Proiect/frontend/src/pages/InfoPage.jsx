import { motion } from "motion/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Info,
  Users,
  Briefcase,
  HelpCircle,
  Shield,
  Truck,
  FileText,
  Lock,
  Cookie,
  Scale,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Wrench,
} from "lucide-react";

export default function InfoPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-bold text-transparent">
            Informații & Suport
          </h1>
          <p className="text-lg text-slate-400">
            Tot ce trebuie să știi despre ConfigEXP
          </p>
        </motion.div>

        <Section id="about" icon={Info} title="Despre ConfigEXP">
          <p className="mb-4">
            ConfigEXP este platforma premium de configurare PC cu asistență AI
            inteligentă, dedicată pasionaților de tehnologie și profesioniștilor
            care doresc să construiască sistemul perfect.
          </p>
          <p className="mb-4">
            Fondată în 2026, ConfigEXP a revoluționat modul în care utilizatorii
            configurează și achiziționează componente PC. Oferim o experiență
            unică care combină tehnologia AI de ultimă generație cu expertiza
            umană, asigurându-ne că fiecare configurație este optimizată pentru
            performanță și compatibilitate.
          </p>
          <p>
            Misiunea noastră este să facem tehnologia PC accesibilă tuturor, de
            la începători la experți, oferind ghidare personalizată și produse
            de cea mai înaltă calitate.
          </p>
        </Section>

        <Section id="how-it-works" icon={HelpCircle} title="Cum funcționează">
          <div className="space-y-6">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-cyan-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
                  1
                </span>
                Alege modul de configurare
              </h3>
              <p className="text-slate-400">
                Poți configura manual selectând fiecare componentă sau poți
                folosi AI ConfigEXP pentru recomandări personalizate bazate pe
                buget și necesități.
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-cyan-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
                  2
                </span>
                Verificare automată
              </h3>
              <p className="text-slate-400">
                Sistemul nostru verifică automat compatibilitatea între
                componente, consumul de energie și potențialele bottleneck-uri.
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-cyan-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
                  3
                </span>
                Salvează și comandă
              </h3>
              <p className="text-slate-400">
                Salvează configurația în cont, compară alternative, și plasează
                comanda când ești gata. Livrăm rapid și oferim asamblare
                profesională.
              </p>
            </div>
          </div>
        </Section>

        <Section id="team" icon={Users} title="Echipa noastră">
          <p className="mb-6">
            ConfigEXP este alimentat de o echipă pasionată de experți în
            hardware, dezvoltatori software și specialiști în inteligență
            artificială.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">Engineering</h4>
              <p className="text-sm text-slate-400">
                Dezvoltatori full-stack și AI specialists care construiesc
                platforma
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">
                Hardware Experts
              </h4>
              <p className="text-sm text-slate-400">
                Specialiști în componente PC cu peste 10 ani experiență
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">
                Customer Support
              </h4>
              <p className="text-sm text-slate-400">
                Echipă dedicată pentru suport tehnic și consultanță
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">Logistică</h4>
              <p className="text-sm text-slate-400">
                Procesare și livrare rapidă în toată România
              </p>
            </div>
          </div>
        </Section>

        <Section id="careers" icon={Briefcase} title="Cariere">
          <p className="mb-4">
            Ne extindem echipa! Căutăm talente pasionate de tehnologie care vor
            să facă parte din revoluția configurării PC.
          </p>
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <h4 className="mb-2 font-semibold text-green-400">
              Poziții deschise:
            </h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Senior Full-Stack Developer (React/Node.js)</li>
              <li>• ML Engineer - Computer Vision</li>
              <li>• Hardware Specialist & Product Manager</li>
              <li>• Customer Success Manager</li>
            </ul>
          </div>
          <p className="text-slate-400">
            Trimite CV-ul la{" "}
            <a
              href="mailto:configexp.app@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              configexp.app@gmail.com
            </a>
          </p>
        </Section>

        <Section id="faq" icon={HelpCircle} title="Întrebări frecvente">
          <div className="space-y-4">
            <FAQItem
              question="Cât durează livrarea?"
              answer="Livrarea standard durează 24-48h în toată România. Pentru comenzile plasate înainte de ora 14:00, expedierea se face în aceeași zi."
            />
            <FAQItem
              question="Pot returna produsele?"
              answer="Da, ai 14 zile drept de returnare conform legislației. Produsele trebuie să fie în ambalajul original, nesigilate și nefolosite."
            />
            <FAQItem
              question="Oferiți servicii de asamblare?"
              answer="Da, oferim servicii profesionale de asamblare PC. Poți adăuga acest serviciu la checkout. Include asamblare, testare și instalare OS."
            />
            <FAQItem
              question="Ce garanție au produsele?"
              answer="Toate produsele au garanție de minimum 24 luni. Multe componente premium vin cu garanție extinsă de până la 5 ani de la producător."
            />
            <FAQItem
              question="AI ConfigEXP este gratuit?"
              answer="Da, serviciul de configurare AI este complet gratuit. Plătești doar produsele pe care le comanzi."
            />
          </div>
        </Section>

        <Section id="help" icon={HelpCircle} title="Centru de ajutor">
          <p className="mb-4">
            Ai nevoie de ajutor? Echipa noastră de suport este disponibilă
            Luni-Vineri 09:00-18:00 și Sâmbătă 10:00-14:00.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <Mail className="mb-2 h-5 w-5 text-cyan-400" />
              <h4 className="mb-1 font-semibold text-white">Email</h4>
              <a
                href="mailto:configexp.app@gmail.com"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                configexp.app@gmail.com
              </a>
              <p className="mt-1 text-xs text-slate-500">Răspuns în 24h</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <Phone className="mb-2 h-5 w-5 text-cyan-400" />
              <h4 className="mb-1 font-semibold text-white">Telefon</h4>
              <a
                href="tel:+40123456789"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                +40 123 456 789
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Luni-Vineri 09-18
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="compatibility"
          icon={CheckCircle}
          title="Verificare compatibilitate"
        >
          <p className="mb-4">
            Sistemul nostru AI verifică automat compatibilitatea între
            componente:
          </p>
          <ul className="mb-4 space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>
                Socket procesor - placă de bază (AM5, LGA1700, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>Tip memorie RAM (DDR4/DDR5) și frecvență suportată</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>
                Dimensiuni placă video vs carcasă și clearance cooler
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>Consum total energie vs putere sursă alimentare</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <span>Form factor placă de bază vs carcasă</span>
            </li>
          </ul>
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
            <p className="text-sm text-cyan-400">
              💡 Dacă detectăm incompatibilități, vei primi alerte în timp real
              cu sugestii de componente alternative.
            </p>
          </div>
        </Section>

        <Section id="warranty" icon={Shield} title="Garanție & Service">
          <p className="mb-4">
            Toate produsele ConfigEXP beneficiază de garanție completă:
          </p>
          <div className="mb-4 space-y-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">
                Garanție standard: 24 luni
              </h4>
              <p className="text-sm text-slate-400">
                Toate produsele au minimum 2 ani garanție conform legislației
                UE.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">
                Garanție extinsă: până la 5 ani
              </h4>
              <p className="text-sm text-slate-400">
                Multe componente premium (procesoare, plăci video high-end) vin
                cu garanție extinsă de la producător.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">Service rapid</h4>
              <p className="text-sm text-slate-400">
                Rezolvăm cererile de garanție în maximum 7 zile lucrătoare.
                Oferim produse de rezervă pe perioada service-ului.
              </p>
            </div>
          </div>
        </Section>

        <Section id="shipping" icon={Truck} title="Livrare & Returnare">
          <h3 className="mb-3 text-lg font-semibold text-white">Livrare</h3>
          <ul className="mb-6 space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">Curier:</strong> 24-48h în toată
                România, gratuit peste 500 RON
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">EasyBox:</strong> Livrare în
                24-48h la punctele partenere
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">Express:</strong> Livrare în
                aceeași zi în București (comandă până la 14:00)
              </span>
            </li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-white">Returnare</h3>
          <p className="mb-4 text-slate-400">
            Poți returna produsele în 14 zile de la primire, fără să dai
            explicații. Condiții:
          </p>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Produsele trebuie să fie în starea originală</li>
            <li>• Ambalajul să fie intact și nesigilat</li>
            <li>• Accesoriile și documentația să fie complete</li>
            <li>• Rambursare în maximum 14 zile de la returnare</li>
          </ul>
        </Section>

        <Section id="assembly" icon={Wrench} title="Servicii asamblare">
          <p className="mb-4">
            Oferim servicii profesionale de asamblare PC executate de tehnicieni
            certificați:
          </p>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">
                Asamblare Standard
              </h4>
              <p className="mb-2 text-2xl font-bold text-cyan-400">199 RON</p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Asamblare completă componente</li>
                <li>• Cable management</li>
                <li>• Testare funcționalitate</li>
                <li>• BIOS setup</li>
              </ul>
            </div>
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <h4 className="mb-2 font-semibold text-cyan-400">
                Asamblare Premium
              </h4>
              <p className="mb-2 text-2xl font-bold text-cyan-400">399 RON</p>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Tot ce include Standard +</li>
                <li>• Instalare Windows 11 Pro</li>
                <li>• Instalare drivere și actualizări</li>
                <li>• Overclock și optimizări</li>
                <li>• Benchmarking complet</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="terms" icon={FileText} title="Termeni și condiții">
          <h3 className="mb-3 text-lg font-semibold text-white">
            1. Acceptarea termenilor
          </h3>
          <p className="mb-4 text-slate-400">
            Utilizând platforma ConfigEXP, accepți acești termeni și condiții în
            totalitate. Dacă nu ești de acord cu oricare dintre aceste condiții,
            te rugăm să nu utilizezi site-ul.
          </p>

          <h3 className="mb-3 text-lg font-semibold text-white">
            2. Utilizarea platformei
          </h3>
          <p className="mb-4 text-slate-400">
            ConfigEXP oferă servicii de configurare PC și vânzare de componente
            hardware. Ne rezervăm dreptul de a modifica, suspenda sau întrerupe
            orice aspect al serviciilor fără notificare prealabilă.
          </p>

          <h3 className="mb-3 text-lg font-semibold text-white">
            3. Comenzi și plăți
          </h3>
          <p className="mb-4 text-slate-400">
            Prețurile afișate sunt în RON și includ TVA. Ne rezervăm dreptul de
            a modifica prețurile fără notificare prealabilă. Confirmarea
            comenzii se face prin email.
          </p>

          <h3 className="mb-3 text-lg font-semibold text-white">
            4. Proprietate intelectuală
          </h3>
          <p className="text-slate-400">
            Tot conținutul ConfigEXP (design, logo, cod sursă, algoritmi AI)
            este protejat prin legi privind drepturile de autor și proprietatea
            intelectuală.
          </p>
        </Section>

        <Section id="privacy" icon={Lock} title="Politică de confidențialitate">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Ce date colectăm
          </h3>
          <p className="mb-4 text-slate-400">
            Colectăm doar datele necesare pentru procesarea comenzilor și
            îmbunătățirea serviciilor:
          </p>
          <ul className="mb-6 space-y-1 text-sm text-slate-400">
            <li>• Nume, prenume, email, telefon</li>
            <li>• Adresă de livrare și facturare</li>
            <li>• Informații despre comenzi și plăți</li>
            <li>• Date tehnice despre dispozitivul tău (cookies, IP)</li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Cum folosim datele
          </h3>
          <ul className="mb-6 space-y-1 text-sm text-slate-400">
            <li>• Procesare și livrare comenzi</li>
            <li>• Comunicare despre status comenzi</li>
            <li>• Îmbunătățire servicii și recomandări personalizate</li>
            <li>• Marketing (doar cu consimțământul tău)</li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Securitatea datelor
          </h3>
          <p className="text-slate-400">
            Folosim criptare SSL pentru toate tranzacțiile. Datele tale sunt
            stocate securizat și nu sunt partajate cu terțe părți fără
            consimțământul tău.
          </p>
        </Section>

        <Section id="gdpr" icon={Shield} title="GDPR & Date personale">
          <p className="mb-4 text-slate-400">
            ConfigEXP respectă în totalitate Regulamentul General privind
            Protecția Datelor (GDPR).
          </p>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Drepturile tale
          </h3>
          <ul className="mb-6 space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">Dreptul de acces:</strong> poți
                solicita o copie a datelor tale personale
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">Dreptul la rectificare:</strong>{" "}
                poți corecta datele incorecte
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">Dreptul la ștergere:</strong>{" "}
                poți solicita ștergerea datelor tale
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>
                <strong className="text-white">
                  Dreptul la portabilitate:
                </strong>{" "}
                poți primi datele în format portabil
              </span>
            </li>
          </ul>

          <p className="text-slate-400">
            Pentru exercitarea drepturilor tale GDPR, contactează-ne la{" "}
            <a
              href="mailto:configexp.app@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              configexp.app@gmail.com
            </a>
          </p>
        </Section>

        <Section id="cookies" icon={Cookie} title="Politică cookies">
          <p className="mb-4 text-slate-400">
            ConfigEXP folosește cookies pentru a îmbunătăți experiența ta pe
            site.
          </p>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Tipuri de cookies
          </h3>
          <div className="mb-6 space-y-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">
                Cookies esențiale
              </h4>
              <p className="text-sm text-slate-400">
                Necesare pentru funcționarea site-ului (autentificare, coș
                cumpărături). Nu pot fi dezactivate.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">
                Cookies de performanță
              </h4>
              <p className="text-sm text-slate-400">
                Colectează date despre cum folosești site-ul pentru a
                îmbunătăți performanța.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h4 className="mb-1 font-semibold text-white">
                Cookies de marketing
              </h4>
              <p className="text-sm text-slate-400">
                Folosite pentru publicitate targetată. Pot fi dezactivate din
                setări.
              </p>
            </div>
          </div>

          <p className="text-slate-400">
            Poți gestiona preferințele cookies din setările browser-ului sau din
            panoul de consimțământ.
          </p>
        </Section>

        <Section id="anpc" icon={Scale} title="ANPC & Protecția consumatorului">
          <p className="mb-4 text-slate-400">
            ConfigEXP respectă legislația românească privind protecția
            consumatorilor și este înregistrat la ANPC.
          </p>

          <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <h4 className="mb-2 font-semibold text-white">
              Soluționarea alternativă a litigiilor (SAL)
            </h4>
            <p className="mb-2 text-sm text-slate-400">
              Conform OUG 34/2014, consumatorii pot apela la soluționarea
              alternativă a litigiilor.
            </p>
            <p className="text-sm text-slate-400">
              Platforma SOL:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <h4 className="mb-2 font-semibold text-white">Contact ANPC</h4>
            <p className="text-sm text-slate-400">
              Pentru reclamații puteți contacta ANPC:
              <br />
              Telefon: 0219544 (luni-vineri 08:00-20:00)
              <br />
              Site:{" "}
              <a
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                www.anpc.ro
              </a>
            </p>
          </div>
        </Section>

        <Section id="contact" icon={Mail} title="Contact">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6">
              <Mail className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 font-semibold text-white">Email</h3>
              <p className="mb-2 text-slate-400">
                Pentru întrebări generale și suport:
              </p>
              <a
                href="mailto:configexp.app@gmail.com"
                className="font-medium text-cyan-400 hover:text-cyan-300"
              >
                configexp.app@gmail.com
              </a>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6">
              <Phone className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 font-semibold text-white">Telefon</h3>
              <p className="mb-2 text-slate-400">Luni-Vineri: 09:00-18:00</p>
              <a
                href="tel:+40123456789"
                className="font-medium text-cyan-400 hover:text-cyan-300"
              >
                +40 123 456 789
              </a>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6">
              <MapPin className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 font-semibold text-white">Adresă</h3>
              <p className="text-slate-400">
                Str. Tehnologiei nr. 42
                <br />
                București, România
                <br />
                012345
              </p>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6">
              <Clock className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 font-semibold text-white">Program</h3>
              <p className="text-slate-400">
                Luni-Vineri: 09:00 - 18:00
                <br />
                Sâmbătă: 10:00 - 14:00
                <br />
                Duminică: Închis
              </p>
            </div>
          </div>
        </Section>

        <Section id="press" icon={FileText} title="Presă">
          <p className="text-slate-400">
            Pentru materiale de presă și colaborări media, contactează-ne la{" "}
            <a
              href="mailto:configexp.app@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              configexp.app@gmail.com
            </a>
          </p>
        </Section>

        <Section id="partners" icon={Users} title="Parteneri">
          <p className="mb-4 text-slate-400">
            Colaborăm cu cei mai importanți producători și distribuitori de
            hardware din România și Europa:
          </p>
          <ul className="space-y-1 text-slate-400">
            <li>• AMD, Intel, NVIDIA - procesoare și plăci video</li>
            <li>• ASUS, MSI, Gigabyte - componente premium</li>
            <li>• Corsair, G.Skill, Kingston - memorie și periferice</li>
            <li>• Samsung, Western Digital - stocare</li>
          </ul>
        </Section>

        <Section id="sitemap" icon={FileText} title="Hartă site">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-white">
                Pagini principale
              </h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Home</li>
                <li>• Configurator manual</li>
                <li>• AI Configurator</li>
                <li>• Componente</li>
                <li>• Wishlist</li>
                <li>• Coș</li>
                <li>• Cont</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">Categorii</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Procesoare</li>
                <li>• Plăci video</li>
                <li>• Plăci de bază</li>
                <li>• Memorie RAM</li>
                <li>• Stocare</li>
                <li>• Surse alimentare</li>
                <li>• Carcase</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="accessibility" icon={Info} title="Accesibilitate">
          <p className="mb-4 text-slate-400">
            ConfigEXP se angajează să ofere o experiență accesibilă pentru toți
            utilizatorii:
          </p>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>Design responsive pentru toate dispozitivele</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>Contrast ridicat pentru text și elemente UI</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>Navigare prin tastatură</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span>Compatibilitate cu screen readers</span>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ id, icon: Icon, title, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="mb-16 scroll-mt-24"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
          <Icon className="h-6 w-6 text-cyan-400" />
        </div>
        <h2 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
          {title}
        </h2>
      </div>
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 backdrop-blur-sm">
        <div className="text-slate-300">{children}</div>
      </div>
    </motion.section>
  );
}

function FAQItem({ question, answer }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <h4 className="mb-2 font-semibold text-white">{question}</h4>
      <p className="text-sm text-slate-400">{answer}</p>
    </div>
  );
}