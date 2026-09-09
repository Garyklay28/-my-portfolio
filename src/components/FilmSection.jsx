import WorkGrid from './Gallery.jsx'

export default function FilmSection({ films, onOpen }) {
  return (
    <section className="wrap" id="works">
      <header className="sechead">
        <div>
          <p className="eyebrow">Films &amp; Motion / 影片</p>
          <h2 className="slab sechead__title">Film</h2>
        </div>
        <p className="sechead__count">{String(films.length).padStart(2, '0')} Works — Selected</p>
      </header>
      <WorkGrid works={films} onOpen={onOpen} />
    </section>
  )
}
