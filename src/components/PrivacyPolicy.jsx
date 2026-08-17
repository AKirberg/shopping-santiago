import { X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const CONTENT = {
  es: {
    title: "Política de Protección de Datos Personales",
    updated: "Última actualización: agosto de 2026",
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        body: `Shopeando (en adelante, "el Sitio") es responsable del tratamiento de los datos personales recopilados en este sitio web. Para consultas relacionadas con esta política, puedes escribirnos a: contacto@shopeando.cl`,
      },
      {
        heading: "2. Marco legal aplicable",
        body: `Esta política se rige por la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719 de Protección de Datos Personales (vigente desde 2024), que moderniza el marco normativo chileno e instaura la Agencia de Protección de Datos Personales (APDP) como autoridad de control.`,
      },
      {
        heading: "3. ¿Qué datos recopilamos y para qué?",
        subsections: [
          {
            sub: "a) Dirección ingresada para buscar malls cercanos",
            detail: `Cuando escribes una dirección en el buscador de ubicación, el texto es enviado al servicio de geocodificación Nominatim (OpenStreetMap Foundation) para obtener coordenadas geográficas aproximadas. Este dato no se almacena en nuestros sistemas ni en tu dispositivo. Solo existe en memoria mientras navegas el Sitio y desaparece al recargar la página.\n\nFinalidad: calcular la distancia entre tu ubicación y los malls de Santiago.\nBase de legitimación: ejecución de la función solicitada por el usuario (art. 4 Ley 19.628; art. 13 letra b Ley 21.719).`,
          },
          {
            sub: "b) Preferencia de idioma",
            detail: `Guardamos tu idioma preferido (español, inglés o portugués) en el almacenamiento local de tu navegador (localStorage) mediante la clave "ss-lang". Este dato nunca abandona tu dispositivo ni es transmitido a ningún servidor.\n\nFinalidad: recordar tu selección de idioma entre visitas.\nBase de legitimación: interés legítimo del responsable para mejorar la experiencia de usuario (art. 13 letra f Ley 21.719).`,
          },
          {
            sub: "c) Opciones del quiz de recomendación y planificador de vuelo",
            detail: `Las respuestas que ingresas en el quiz (zona, categoría, tiempo disponible, transporte, niños, objetivo de compra) y los datos del planificador de último minuto (hora de vuelo, tiempo de traslado al aeropuerto) existen únicamente en la memoria temporal del navegador. No se almacenan, no se envían a ningún servidor y desaparecen al cerrar o recargar la página.\n\nFinalidad: generar recomendaciones personalizadas localmente en tu dispositivo.`,
          },
        ],
      },
      {
        heading: "4. Datos que NO recopilamos",
        body: `El Sitio no recopila ni procesa: nombres, correos electrónicos, teléfonos, documentos de identidad, datos de pago, datos de geolocalización GPS del dispositivo (no solicitamos permiso de ubicación al navegador), ni ningún tipo de información sensible según la ley chilena.`,
      },
      {
        heading: "5. Cookies y tecnologías similares",
        body: `El Sitio no utiliza cookies propias ni de terceros con fines publicitarios o de seguimiento. El único almacenamiento persistente utilizado es localStorage para la preferencia de idioma (véase sección 3b). No empleamos píxeles de seguimiento, fingerprinting ni ninguna tecnología de rastreo de usuarios.\n\nPara conocer estadísticas de uso (número de visitas, páginas más consultadas, países de acceso y tipos de dispositivos) utilizamos Umami Analytics, un servicio de analítica web que opera sin cookies, sin recopilar datos personales identificables y sin compartir información con terceros con fines publicitarios. Umami cumple con la normativa GDPR y es compatible con la Ley N° 21.719.`,
      },
      {
        heading: "6. Servicios de terceros",
        subsections: [
          {
            sub: "Umami Analytics",
            detail: `El Sitio utiliza Umami Analytics (https://umami.is), un servicio de analítica web respetuoso de la privacidad, operado por Umami Software Inc. con servidores en Estados Unidos y Europa.\n\nUmami registra métricas agregadas de uso: páginas visitadas, país de origen (a partir del idioma del navegador o IP anonimizada), tipo de dispositivo y fuente de referencia. No crea perfiles individuales, no utiliza cookies ni técnicas de fingerprinting y no comparte datos con redes publicitarias.\n\nFinalidad: conocer el uso del Sitio para mejorarlo.\nBase de legitimación: interés legítimo del responsable (art. 13 letra f Ley 21.719).\nPolítica de privacidad de Umami: https://umami.is/privacy`,
          },
          {
            sub: "Nominatim / OpenStreetMap Foundation",
            detail: `Al ingresar una dirección, tu consulta es enviada a la API pública de Nominatim (https://nominatim.openstreetmap.org), operada por la OpenStreetMap Foundation (OSMF) con servidores en Europa. La OSMF puede registrar temporalmente las consultas con fines operativos. Consulta su política de uso en: https://nominatim.org/release-docs/latest/api/Search/`,
          },
          {
            sub: "Teselas de mapas (OpenStreetMap)",
            detail: `La sección de Galerías Históricas muestra un mapa interactivo que carga imágenes desde los servidores de teselas de OpenStreetMap (tile.openstreetmap.org). Al cargar estas imágenes, tu dirección IP puede quedar registrada en los servidores de OSM de forma temporal.`,
          },
          {
            sub: "Google Maps (enlaces externos)",
            detail: `Algunas tarjetas de malls, galerías y rutas incluyen enlaces que abren Google Maps en una nueva pestaña. Al hacer clic, eres redirigido a los servidores de Google y quedan sujetos a la Política de Privacidad de Google (https://policies.google.com/privacy). El Sitio no transmite datos a Google por su cuenta.`,
          },
        ],
      },
      {
        heading: "7. Transferencias internacionales de datos",
        body: `La dirección ingresada para geocodificación es procesada por servidores ubicados en Europa (OpenStreetMap Foundation). Esta transferencia es necesaria para el funcionamiento del servicio y se realiza bajo los estándares de protección de datos de la Unión Europea, considerados adecuados conforme al art. 25 de la Ley 21.719.`,
      },
      {
        heading: "8. Plazo de conservación",
        body: `Los datos ingresados (dirección, opciones del quiz, hora de vuelo) no son conservados: desaparecen al cerrar o recargar la página. La preferencia de idioma se conserva en tu navegador hasta que la cambies o borres el almacenamiento local de tu dispositivo.`,
      },
      {
        heading: "9. Tus derechos",
        body: `De acuerdo con la Ley N° 21.719, tienes los siguientes derechos respecto de tus datos personales:\n\n• Acceso: conocer qué datos tenemos sobre ti.\n• Rectificación: corregir datos inexactos.\n• Supresión: solicitar la eliminación de tus datos.\n• Oposición: oponerte a ciertos tratamientos.\n• Portabilidad: recibir tus datos en formato estructurado.\n• Revocación del consentimiento: cuando el tratamiento se base en él.\n\nDado que el Sitio no almacena datos personales identificables en servidores propios, el ejercicio práctico de estos derechos se limita al dato de preferencia de idioma, que puedes borrar directamente desde la configuración de tu navegador (Herramientas > Almacenamiento > Local Storage).\n\nPara consultas formales, escríbenos a: contacto@shopeando.cl`,
      },
      {
        heading: "10. Seguridad",
        body: `El Sitio opera íntegramente en el lado del cliente (navegador). Al no existir una base de datos propia ni cuentas de usuario, el riesgo de filtración de datos personales es mínimo. Las comunicaciones con los servicios de terceros mencionados se realizan a través de conexiones HTTPS cifradas.`,
      },
      {
        heading: "11. Modificaciones a esta política",
        body: `Podemos actualizar esta política cuando sea necesario, por ejemplo ante cambios en la legislación o en las funcionalidades del Sitio. La fecha de "Última actualización" al inicio del documento refleja la versión vigente. Te recomendamos revisar periódicamente esta sección.`,
      },
      {
        heading: "12. Contacto y reclamaciones",
        body: `Para consultas, solicitudes de ejercicio de derechos o reclamaciones relacionadas con el tratamiento de tus datos, contáctanos en: contacto@shopeando.cl\n\nSi consideras que el tratamiento de tus datos infringe la normativa vigente, tienes derecho a presentar una reclamación ante la Agencia de Protección de Datos Personales (APDP), una vez que dicha autoridad esté plenamente operativa conforme a la Ley 21.719.`,
      },
    ],
  },
  en: {
    title: "Personal Data Protection Policy",
    updated: "Last updated: August 2026",
    sections: [
      {
        heading: "1. Data Controller",
        body: `Shopeando ("the Site") is responsible for the processing of personal data collected on this website. For inquiries related to this policy, contact us at: contacto@shopeando.cl`,
      },
      {
        heading: "2. Applicable Legal Framework",
        body: `This policy is governed by Chilean Law No. 19.628 on the Protection of Private Life and Law No. 21.719 on Personal Data Protection (in force since 2024), which modernizes Chile's regulatory framework and establishes the Personal Data Protection Agency (APDP) as the supervisory authority.`,
      },
      {
        heading: "3. What data do we collect and why?",
        subsections: [
          {
            sub: "a) Address entered to find nearby malls",
            detail: `When you type an address into the location search bar, the text is sent to the Nominatim geocoding service (OpenStreetMap Foundation) to obtain approximate geographic coordinates. This data is not stored on our systems or your device. It only exists in memory while you browse the Site and disappears when the page is reloaded.\n\nPurpose: calculate the distance between your location and Santiago malls.\nLegal basis: performance of the function requested by the user.`,
          },
          {
            sub: "b) Language preference",
            detail: `We save your preferred language (Spanish, English, or Portuguese) in your browser's local storage (localStorage) under the key "ss-lang". This data never leaves your device and is never transmitted to any server.\n\nPurpose: remember your language selection between visits.\nLegal basis: legitimate interest to improve user experience.`,
          },
          {
            sub: "c) Quiz answers and flight planner data",
            detail: `Your quiz answers (zone, category, time available, transport, children, shopping goal) and last-minute planner data (flight time, airport transfer time) exist only in temporary browser memory. They are not stored, not sent to any server, and disappear when you close or reload the page.\n\nPurpose: generate personalized recommendations locally on your device.`,
          },
        ],
      },
      {
        heading: "4. Data we do NOT collect",
        body: `The Site does not collect or process: names, email addresses, phone numbers, identity documents, payment data, GPS geolocation data (we do not request location permission from the browser), or any type of sensitive information under Chilean law.`,
      },
      {
        heading: "5. Cookies and similar technologies",
        body: `The Site does not use first-party or third-party cookies for advertising or tracking purposes. The only persistent storage used is localStorage for language preference (see section 3b). We do not use tracking pixels, fingerprinting, or any user tracking technology.\n\nTo understand how the Site is used (number of visits, most-viewed pages, countries of origin, and device types) we use Umami Analytics, a web analytics service that operates without cookies, without collecting identifiable personal data, and without sharing information with third parties for advertising purposes. Umami complies with GDPR and is compatible with Chilean Law No. 21.719.`,
      },
      {
        heading: "6. Third-party services",
        subsections: [
          {
            sub: "Umami Analytics",
            detail: `The Site uses Umami Analytics (https://umami.is), a privacy-respecting web analytics service operated by Umami Software Inc. with servers in the United States and Europe.\n\nUmami records aggregated usage metrics: pages visited, country of origin (derived from browser language or anonymized IP), device type, and referral source. It does not create individual profiles, does not use cookies or fingerprinting techniques, and does not share data with advertising networks.\n\nPurpose: understand Site usage in order to improve it.\nLegal basis: legitimate interest of the data controller.\nUmami Privacy Policy: https://umami.is/privacy`,
          },
          {
            sub: "Nominatim / OpenStreetMap Foundation",
            detail: `When you enter an address, your query is sent to the Nominatim public API (https://nominatim.openstreetmap.org), operated by the OpenStreetMap Foundation (OSMF) with servers in Europe. OSMF may temporarily log queries for operational purposes.`,
          },
          {
            sub: "Map tiles (OpenStreetMap)",
            detail: `The Historic Galleries section displays an interactive map that loads images from OpenStreetMap tile servers (tile.openstreetmap.org). When loading these images, your IP address may be temporarily logged on OSM servers.`,
          },
          {
            sub: "Google Maps (external links)",
            detail: `Some mall, gallery, and route cards include links that open Google Maps in a new tab. When clicked, you are redirected to Google's servers and subject to Google's Privacy Policy (https://policies.google.com/privacy). The Site does not transmit data to Google on its own.`,
          },
        ],
      },
      {
        heading: "7. International Data Transfers",
        body: `Addresses entered for geocoding are processed by servers located in Europe (OpenStreetMap Foundation). This transfer is necessary for the service to function and is carried out under EU data protection standards, considered adequate under Art. 25 of Law 21.719.`,
      },
      {
        heading: "8. Retention Period",
        body: `Data entered (address, quiz options, flight time) is not retained — it disappears when you close or reload the page. The language preference is retained in your browser until you change it or clear your device's local storage.`,
      },
      {
        heading: "9. Your Rights",
        body: `Under Law No. 21.719, you have the following rights regarding your personal data:\n\n• Access: know what data we hold about you.\n• Rectification: correct inaccurate data.\n• Erasure: request deletion of your data.\n• Objection: object to certain processing activities.\n• Portability: receive your data in a structured format.\n• Withdrawal of consent: where processing is based on consent.\n\nSince the Site does not store identifiable personal data on its own servers, exercising these rights is practically limited to the language preference, which you can delete directly from your browser settings (Tools > Storage > Local Storage).\n\nFor formal inquiries: contacto@shopeando.cl`,
      },
      {
        heading: "10. Security",
        body: `The Site operates entirely client-side (in the browser). With no own database or user accounts, the risk of personal data leakage is minimal. Communications with the third-party services mentioned are carried out over encrypted HTTPS connections.`,
      },
      {
        heading: "11. Policy Updates",
        body: `We may update this policy when necessary, for example due to changes in legislation or Site features. The "Last updated" date at the top of the document reflects the current version.`,
      },
      {
        heading: "12. Contact and Complaints",
        body: `For inquiries, rights requests, or complaints related to data processing, contact us at: contacto@shopeando.cl\n\nIf you believe that the processing of your data violates applicable regulations, you have the right to file a complaint with the Personal Data Protection Agency (APDP) once that authority is fully operational under Law 21.719.`,
      },
    ],
  },
  pt: {
    title: "Política de Proteção de Dados Pessoais",
    updated: "Última atualização: agosto de 2026",
    sections: [
      {
        heading: "1. Responsável pelo tratamento",
        body: `Shopeando ("o Site") é responsável pelo tratamento dos dados pessoais recolhidos neste website. Para consultas relacionadas com esta política, contacte-nos em: contacto@shopeando.cl`,
      },
      {
        heading: "2. Marco legal aplicável",
        body: `Esta política é regida pela Lei N° 19.628 sobre Proteção da Vida Privada e pela Lei N° 21.719 de Proteção de Dados Pessoais (em vigor desde 2024), que moderniza o quadro regulatório chileno e cria a Agência de Proteção de Dados Pessoais (APDP) como autoridade de controlo.`,
      },
      {
        heading: "3. Que dados recolhemos e para quê?",
        subsections: [
          {
            sub: "a) Endereço inserido para encontrar malls próximos",
            detail: `Quando você digita um endereço na barra de pesquisa de localização, o texto é enviado ao serviço de geocodificação Nominatim (OpenStreetMap Foundation) para obter coordenadas geográficas aproximadas. Este dado não é armazenado nos nossos sistemas nem no seu dispositivo.\n\nFinalidade: calcular a distância entre a sua localização e os malls de Santiago.\nBase legal: execução da função solicitada pelo utilizador.`,
          },
          {
            sub: "b) Preferência de idioma",
            detail: `Guardamos o seu idioma preferido (espanhol, inglês ou português) no armazenamento local do navegador (localStorage) com a chave "ss-lang". Este dado nunca sai do seu dispositivo.\n\nFinalidade: lembrar a sua seleção de idioma entre visitas.\nBase legal: interesse legítimo para melhorar a experiência do utilizador.`,
          },
          {
            sub: "c) Respostas do quiz e dados do planejador de voo",
            detail: `As suas respostas no quiz e os dados do planejador de última hora (hora do voo, tempo de deslocamento ao aeroporto) existem apenas na memória temporária do navegador. Não são armazenados nem enviados a nenhum servidor.\n\nFinalidade: gerar recomendações personalizadas localmente no seu dispositivo.`,
          },
        ],
      },
      {
        heading: "4. Dados que NÃO recolhemos",
        body: `O Site não recolhe nem processa: nomes, emails, telefones, documentos de identidade, dados de pagamento, geolocalização GPS (não solicitamos permissão de localização ao navegador), nem qualquer tipo de informação sensível.`,
      },
      {
        heading: "5. Cookies e tecnologias similares",
        body: `O Site não utiliza cookies próprios ou de terceiros para fins publicitários ou de rastreamento. O único armazenamento persistente é o localStorage para a preferência de idioma (ver secção 3b). Não utilizamos pixels de rastreamento, fingerprinting nem qualquer tecnologia de rastreamento de utilizadores.\n\nPara compreender como o Site é utilizado (número de visitas, páginas mais consultadas, países de origem e tipos de dispositivos) utilizamos o Umami Analytics, um serviço de análise web que funciona sem cookies, sem recolher dados pessoais identificáveis e sem partilhar informações com terceiros para fins publicitários. O Umami cumpre o RGPD e é compatível com a Lei N° 21.719.`,
      },
      {
        heading: "6. Serviços de terceiros",
        subsections: [
          {
            sub: "Umami Analytics",
            detail: `O Site utiliza o Umami Analytics (https://umami.is), um serviço de análise web respeitador da privacidade, operado pela Umami Software Inc. com servidores nos Estados Unidos e na Europa.\n\nO Umami regista métricas agregadas de utilização: páginas visitadas, país de origem (a partir do idioma do navegador ou IP anonimizado), tipo de dispositivo e fonte de referência. Não cria perfis individuais, não utiliza cookies nem técnicas de fingerprinting e não partilha dados com redes publicitárias.\n\nFinalidade: conhecer a utilização do Site para o melhorar.\nBase legal: interesse legítimo do responsável pelo tratamento.\nPolítica de privacidade do Umami: https://umami.is/privacy`,
          },
          {
            sub: "Nominatim / OpenStreetMap Foundation",
            detail: `Ao inserir um endereço, a sua consulta é enviada à API pública do Nominatim (https://nominatim.openstreetmap.org), operada pela OpenStreetMap Foundation com servidores na Europa.`,
          },
          {
            sub: "Tiles de mapa (OpenStreetMap)",
            detail: `A secção de Galerias Históricas exibe um mapa interativo que carrega imagens dos servidores de tiles do OpenStreetMap. Ao carregar estas imagens, o seu endereço IP pode ser temporariamente registado nos servidores do OSM.`,
          },
          {
            sub: "Google Maps (links externos)",
            detail: `Alguns cartões de malls, galerias e rotas incluem links que abrem o Google Maps numa nova aba. Ao clicar, é redirecionado para os servidores do Google e sujeito à Política de Privacidade do Google.`,
          },
        ],
      },
      {
        heading: "7. Transferências internacionais de dados",
        body: `Os endereços inseridos para geocodificação são processados por servidores localizados na Europa (OpenStreetMap Foundation). Esta transferência é necessária para o funcionamento do serviço e realiza-se ao abrigo dos padrões europeus de proteção de dados.`,
      },
      {
        heading: "8. Prazo de conservação",
        body: `Os dados inseridos (endereço, opções do quiz, hora do voo) não são conservados — desaparecem ao fechar ou recarregar a página. A preferência de idioma é conservada no navegador até que a altere ou limpe o armazenamento local do seu dispositivo.`,
      },
      {
        heading: "9. Os seus direitos",
        body: `Ao abrigo da Lei N° 21.719, tem os seguintes direitos relativamente aos seus dados pessoais:\n\n• Acesso: saber que dados temos sobre si.\n• Retificação: corrigir dados inexatos.\n• Supressão: solicitar a eliminação dos seus dados.\n• Oposição: opor-se a certos tratamentos.\n• Portabilidade: receber os seus dados em formato estruturado.\n• Revogação do consentimento: quando o tratamento se baseie nele.\n\nPara consultas formais: contacto@shopeando.cl`,
      },
      {
        heading: "10. Segurança",
        body: `O Site funciona inteiramente no lado do cliente (navegador). Sem base de dados própria nem contas de utilizador, o risco de vazamento de dados pessoais é mínimo. As comunicações com os serviços de terceiros mencionados são realizadas através de ligações HTTPS cifradas.`,
      },
      {
        heading: "11. Atualizações desta política",
        body: `Podemos atualizar esta política quando necessário. A data de "Última atualização" no início do documento reflete a versão em vigor.`,
      },
      {
        heading: "12. Contacto e reclamações",
        body: `Para consultas, pedidos de exercício de direitos ou reclamações: contacto@shopeando.cl\n\nSe considerar que o tratamento dos seus dados viola a legislação aplicável, tem o direito de apresentar uma reclamação à Agência de Proteção de Dados Pessoais (APDP).`,
      },
    ],
  },
};

function PolicySection({ section }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-extrabold text-ink">{section.heading}</h3>
      {section.body && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{section.body}</p>
      )}
      {section.subsections && (
        <div className="mt-2 space-y-3">
          {section.subsections.map((sub, i) => (
            <div key={i} className="rounded-xl border border-ink/8 bg-white/60 px-4 py-3">
              <p className="mb-1 text-xs font-bold text-ink/80">{sub.sub}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/65">{sub.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrivacyPolicy({ onClose }) {
  const { locale } = useLanguage();
  const lang = locale === "pt" ? "pt" : locale === "en" ? "en" : "es";
  const c = CONTENT[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#f8faf6] shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink/8 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-leaf">
              {lang === "es" ? "Privacidad" : lang === "pt" ? "Privacidade" : "Privacy"}
            </p>
            <h2 className="mt-0.5 text-base font-extrabold text-ink">{c.title}</h2>
            <p className="mt-0.5 text-xs text-ink/40">{c.updated}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-ink/30 transition hover:bg-ink/8 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Law badge */}
        <div className="flex gap-2 border-b border-ink/8 bg-leaf/5 px-6 py-3">
          <span className="inline-block rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-leaf">
            Ley N° 19.628
          </span>
          <span className="inline-block rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-leaf">
            Ley N° 21.719
          </span>
          <span className="inline-block rounded-full border border-ink/15 bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink/50">
            Chile 🇨🇱
          </span>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6">
          {c.sections.map((section, i) => (
            <PolicySection key={i} section={section} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-ink/8 bg-white/50 px-6 py-4">
          <p className="text-center text-xs text-ink/40">
            contacto@shopeando.cl · Shopeando · Santiago, Chile
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
