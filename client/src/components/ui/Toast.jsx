import { Check } from 'lucide-react'

export default function Toast({ visible, message }) {
  return (
    <div
      className={`fixed bottom-7 left-1/2 z-[300] flex max-w-[90vw] items-center gap-3 rounded-[13px] px-6 py-4 text-[14px] text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.5)] transition-transform duration-[450ms] ${
        visible ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[120%]'
      }`}
      style={{ background: 'var(--koma-teal-dark)', border: '1px solid rgba(0,121,140,.4)' }}
    >
      <Check size={20} className="flex-shrink-0" style={{ color: 'var(--koma-teal)' }} />
      <span>{message}</span>
    </div>
  )
}
