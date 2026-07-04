export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-md px-6 py-3 min-h-[44px] transition-colors duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2'

  const variants = {
    primary: 'bg-brand-cream text-brand-green-dark hover:bg-brand-gold',
    secondary: 'bg-brand-green text-white hover:bg-brand-green-light',
    'outline-white': 'border-2 border-white text-white hover:bg-white/10',
    'outline-green': 'border-2 border-brand-green text-brand-green hover:bg-brand-green-pale',
    ghost: 'text-brand-green hover:bg-brand-green-pale',
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
