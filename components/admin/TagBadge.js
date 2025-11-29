/**
 * Tag Badge Component
 * แสดง tag badge สวยๆ พร้อม emoji
 */

export default function TagBadge({ tag, onRemove, size = 'sm' }) {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-2.5 py-1',
    md: 'text-base px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${tag.tag_color}20`, // 20 = opacity 12%
        color: tag.tag_color,
        border: `1px solid ${tag.tag_color}40`
      }}
    >
      {tag.emoji && <span>{tag.emoji}</span>}
      <span>{tag.tag_name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tag)
          }}
          className="hover:opacity-70 transition"
          title="ลบ tag"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}
