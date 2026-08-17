import { motion } from "framer-motion";

export function MascotBase({ children, label, color, ...props }) {
  return (
    <motion.div
      role="img"
      aria-label={label}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 96, height: 96, color }}
      {...props}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        {children}
      </svg>
    </motion.div>
  );
}

export function ToffyBody() {
  return (
    <>
      <circle cx="60" cy="68" r="42" fill="#fb923c" />
      <path d="M30 40 L22 18 L44 34 Z" fill="#fb923c" />
      <path d="M90 40 L98 18 L76 34 Z" fill="#fb923c" />
      <path
        d="M36 34 L32 22"
        stroke="#c2410c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M84 34 L88 22"
        stroke="#c2410c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="46" cy="64" r="5" fill="#1f2937" />
      <circle cx="74" cy="64" r="5" fill="#1f2937" />
      <path
        d="M52 80 Q60 88 68 80"
        stroke="#7c2d12"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M44 88 L40 96 M76 88 L80 96"
        stroke="#7c2d12"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

export function ToffyCat(props) {
  return (
    <MascotBase label="Toffy the cat" color="#f97316" {...props}>
      <ToffyBody />
    </MascotBase>
  );
}

export function JummiBody() {
  return (
    <>
      <circle cx="60" cy="70" r="38" fill="#f9a8d4" />
      <circle cx="34" cy="46" r="20" fill="#f9a8d4" />
      <circle cx="86" cy="46" r="20" fill="#f9a8d4" />
      <circle cx="34" cy="46" r="10" fill="#f472b6" />
      <circle cx="86" cy="46" r="10" fill="#f472b6" />
      <circle cx="48" cy="66" r="5" fill="#1f2937" />
      <circle cx="72" cy="66" r="5" fill="#1f2937" />
      <circle cx="60" cy="74" r="7" fill="#be185d" />
      <path
        d="M52 86 Q60 92 68 86"
        stroke="#9d174d"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

export function JummiMouse(props) {
  return (
    <MascotBase label="Jummi the mouse" color="#ec4899" {...props}>
      <JummiBody />
    </MascotBase>
  );
}

export function HootyOwl(props) {
  return (
    <MascotBase label="Hooty the owl" color="#8b5cf6" {...props}>
      <circle cx="60" cy="66" r="40" fill="#a78bfa" />
      <path d="M30 62 L18 40 L38 52 Z" fill="#8b5cf6" />
      <path d="M90 62 L102 40 L82 52 Z" fill="#8b5cf6" />
      <circle cx="46" cy="62" r="14" fill="#f8fafc" />
      <circle cx="74" cy="62" r="14" fill="#f8fafc" />
      <circle cx="46" cy="62" r="6" fill="#312e81" />
      <circle cx="74" cy="62" r="6" fill="#312e81" />
      <path
        d="M52 80 Q60 88 68 80"
        stroke="#5b21b6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M56 88 L56 96 M64 88 L64 96"
        stroke="#5b21b6"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </MascotBase>
  );
}

export function DizzyDog(props) {
  return (
    <MascotBase label="Dizzy the dog" color="#92400e" {...props}>
      <circle cx="60" cy="70" r="40" fill="#d97706" />
      <ellipse
        cx="24"
        cy="64"
        rx="16"
        ry="34"
        fill="#b45309"
        transform="rotate(15 24 64)"
      />
      <ellipse
        cx="96"
        cy="64"
        rx="16"
        ry="34"
        fill="#b45309"
        transform="rotate(-15 96 64)"
      />
      <ellipse
        cx="24"
        cy="64"
        rx="8"
        ry="22"
        fill="#fbbf24"
        transform="rotate(15 24 64)"
      />
      <ellipse
        cx="96"
        cy="64"
        rx="8"
        ry="22"
        fill="#fbbf24"
        transform="rotate(-15 96 64)"
      />
      <circle cx="46" cy="66" r="6" fill="#1f2937" />
      <circle cx="74" cy="66" r="6" fill="#1f2937" />
      <circle cx="60" cy="78" r="9" fill="#451a03" />
      <path
        d="M52 92 Q60 98 68 92"
        stroke="#451a03"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </MascotBase>
  );
}

export function BunboRabbit(props) {
  return (
    <MascotBase label="Bunbo the rabbit" color="#f472b6" {...props}>
      <circle cx="60" cy="74" r="36" fill="#fbcfe8" />
      <ellipse cx="38" cy="38" rx="12" ry="28" fill="#fbcfe8" />
      <ellipse cx="82" cy="38" rx="12" ry="28" fill="#fbcfe8" />
      <ellipse cx="38" cy="38" rx="5" ry="18" fill="#f9a8d4" />
      <ellipse cx="82" cy="38" rx="5" ry="18" fill="#f9a8d4" />
      <circle cx="48" cy="70" r="5" fill="#1f2937" />
      <circle cx="72" cy="70" r="5" fill="#1f2937" />
      <path
        d="M54 84 Q60 90 66 84"
        stroke="#9d174d"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="79" r="4" fill="#f472b6" />
    </MascotBase>
  );
}
