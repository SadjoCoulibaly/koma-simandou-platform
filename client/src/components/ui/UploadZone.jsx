import { useRef, useState } from 'react'
import { Upload, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function UploadZone({
  value,
  onChange,
  bucket = 'logos',
  folder = '',
  accept = 'image/*',
  label = 'Choisir une image',
  maxMb = 5,
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (file.size > maxMb * 1024 * 1024) { setError(`Fichier trop lourd (max ${maxMb} Mo)`); return }
    setUploading(true); setError('')
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = folder ? `${folder}/${name}` : name
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(publicUrl)
    } catch (e) { setError(e.message || 'Erreur upload') }
    finally { setUploading(false) }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {value ? (
        <div className="flex flex-col gap-2">
          <img
            src={value}
            alt=""
            className="h-20 max-w-[200px] object-contain rounded-[10px] border border-pine/14 bg-white block"
          />
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            disabled={uploading}
            className="inline-flex w-fit items-center gap-1.5 rounded-[7px] border border-pine/14 bg-bone px-3 py-1.5 text-[12px] font-medium text-ink cursor-pointer hover:bg-koma-teal-light hover:border-koma-teal transition-colors disabled:opacity-60"
          >
            <Upload size={11} /> {uploading ? 'Upload…' : 'Changer'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-pine/20 bg-bone px-5 py-5 cursor-pointer transition-all hover:border-koma-teal hover:bg-koma-teal-light disabled:opacity-60"
        >
          {uploading
            ? <span className="h-6 w-6 border-2 border-koma-teal/30 border-t-koma-teal rounded-full animate-spin" />
            : <ImageIcon size={24} style={{ color: 'var(--koma-teal)' }} />
          }
          <span className="text-[13px] font-semibold text-[#6b7280]">
            {uploading ? 'Upload en cours…' : label}
          </span>
          <span className="text-[11px] text-[#9CA3AF]">JPG, PNG, WebP — max {maxMb} Mo</span>
        </button>
      )}
      {error && <p className="text-[12px] mt-1" style={{ color: 'var(--koma-red)' }}>{error}</p>}
    </div>
  )
}
