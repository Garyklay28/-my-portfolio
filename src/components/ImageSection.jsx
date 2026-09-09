import WorkGrid from './Gallery.jsx'

/** 图片页：按项目分组，同一项目的静帧归在各自的层级下 */
export default function ImageSection({ groups, onOpen }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <section className="wrap">
      <header className="sechead">
        <div>
          <p className="eyebrow">Stills &amp; Photography / 图片</p>
          <h2 className="slab sechead__title">Images</h2>
        </div>
        <p className="sechead__count">
          {String(groups.length).padStart(2, '0')} Projects — {String(total).padStart(2, '0')} Stills
        </p>
      </header>

      {groups.map((g, gi) => (
        <section className="project" key={g.id}>
          <header className="project__head">
            <span className="project__num" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span>
            <div className="project__id">
              <h3 className="slab project__title">{g.title}</h3>
              <p className="project__cn">{g.titleCn} · {g.meta}</p>
            </div>
            <p className="project__role">{g.role}</p>
          </header>

          <WorkGrid works={g.items} onOpen={(i) => onOpen(g.items, i)} bare />
        </section>
      ))}
    </section>
  )
}
