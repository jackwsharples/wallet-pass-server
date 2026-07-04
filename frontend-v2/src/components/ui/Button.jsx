export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) {
  const base =
    'inline-flex items-center justify-center font-semibold tracking-wide rounded-lg px-6 py-2.5 transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold'

  const variants = {
    primary: 'bg-brand-cream text-brand-green-dark hover:bg-brand-gold hover:scale-[1.03] shadow-md active:scale-100',
    secondary: 'bg-brand-green text-white hover:bg-brand-green-light hover:scale-[1.03] shadow-md active:scale-100',
    'outline-white': 'border-2 border-white text-white hover:bg-white/10 hover:scale-[1.03] active:scale-100',
    'outline-green': 'border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white hover:scale-[1.03] active:scale-100',
    ghost: 'text-brand-green hover:bg-brand-cream hover:scale-[1.02] active:scale-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
