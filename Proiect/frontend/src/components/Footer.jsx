import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Cpu,
} from "lucide-react";

function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Mulțumim pentru abonare! 🎉");
    setEmail("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <footer className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-black">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-6 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                <Cpu className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
                  ConfigEXP
                </div>
              </div>
            </Link>

            <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-400">
              Platformă premium de configurare PC cu asistență AI inteligentă.
              Construiește sistemul perfect cu componente de top, verificare
              automată a compatibilității și consiliere specializată.
            </p>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-white">
                Newsletter
              </h4>
              <p className="mb-3 text-sm text-slate-400">
                Primește oferte exclusive și noutăți hardware.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email-ul tău"
                  required
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">
                Urmărește-ne
              </h4>
              <div className="flex gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Despre ConfigEXP
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#about" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Despre noi
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#how-it-works" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Cum funcționează
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#team" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Echipa noastră
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#careers" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Cariere
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#press" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Presă
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#partners" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Parteneri
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Servicii & Suport
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#faq" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Întrebări frecvente
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#help" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Centru de ajutor
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#compatibility" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Verificare compatibilitate
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#warranty" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Garanție & Service
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#shipping" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Livrare & Returnare
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#assembly" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Servicii asamblare
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Legal & Contact
            </h3>
            <ul className="mb-6 space-y-3">
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#terms" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#privacy" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Politică de confidențialitate
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#gdpr" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  GDPR & Date personale
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#cookies" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Politică cookies
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: "/info", hash: "#anpc" }}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  ANPC & Protecția consumatorului
                </Link>
              </li>
            </ul>

            <div className="space-y-2">
              <a
                href="mailto:contact@configexp.ro"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                <Mail className="h-4 w-4" />
                contact@configexp.ro
              </a>
              <a
                href="tel:+40123456789"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                <Phone className="h-4 w-4" />
                +40 123 456 789
              </a>
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Str. Tehnologiei nr. 42
                  <br />
                  București, România
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © 2026 ConfigEXP. Toate drepturile rezervate.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                to={{ pathname: "/info", hash: "#sitemap" }}
                className="text-sm text-slate-500 transition-colors hover:text-cyan-400"
              >
                Hartă site
              </Link>
              <Link
                to={{ pathname: "/info", hash: "#accessibility" }}
                className="text-sm text-slate-500 transition-colors hover:text-cyan-400"
              >
                Accesibilitate
              </Link>

              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg"
                  alt="EU Flag"
                  className="h-4 w-6 rounded"
                />
                <span className="text-sm text-slate-500">Comercializat în UE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;