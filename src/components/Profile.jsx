import { PROFILE } from '../data/works.js'
import SmartImage from './SmartImage.jsx'

export default function Profile() {
  return (
    <section className="wrap profile" id="about">
      <header className="sechead">
        <div>
          <p className="eyebrow">04 — Profile / 简介</p>
          <h2 className="slab sechead__title">About</h2>
        </div>
        <p className="sechead__count">Director · Editor · Sound</p>
      </header>

      <div className="profile__intro">
        <figure className="profile__photo" style={{ margin: 0 }}>
          <SmartImage src={PROFILE.portrait} alt={`${PROFILE.name} portrait`} index="01" ratio="4 / 5" />
        </figure>

        <div>
          <p className="eyebrow">{PROFILE.role}</p>
          <h3 className="slab" style={{ fontSize: 'clamp(30px, 4.4vw, 62px)', margin: '8px 0 22px' }}>
            {PROFILE.name}
          </h3>
          <p className="profile__bio">{PROFILE.bio}</p>
          <p className="profile__bio profile__bio--en">{PROFILE.bioEn}</p>
        </div>
      </div>

      <div className="laurels">
        {PROFILE.laurels.map((src) => (
          <img className="laurels__img" src={src} alt="" key={src} loading="lazy" decoding="async" />
        ))}
      </div>

      <div className="cols">
        <div>
          <div className="block">
            <h4 className="block__head">Education / 教育背景</h4>
            {PROFILE.education.map((e) => (
              <div className="row" key={e.degree}>
                <div>
                  <div className="row__main">{e.degree}</div>
                  <div className="row__sub">{e.school}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="block">
            <h4 className="block__head">Awards / 获奖</h4>
            {PROFILE.awards.map((a, i) => (
              <div className="row" key={`${a.festival}-${a.prize}-${i}`}>
                <div>
                  <div className="row__main">{a.prize}</div>
                  <div className="row__sub">{a.festival}</div>
                </div>
                <span className={`row__tag ${a.status === 'Winner' ? 'row__tag--win' : ''}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="block">
            <h4 className="block__head">Film Credits / 影片经历</h4>
            {PROFILE.credits.map((c) => (
              <div className="row" key={c.title}>
                <div>
                  <div className="row__main">{c.title}</div>
                  <div className="row__sub">{c.role}</div>
                </div>
                <span className="row__tag">{c.kind}</span>
              </div>
            ))}
          </div>

          <div className="block">
            <h4 className="block__head">Work Experience / 工作经历</h4>
            {PROFILE.work.map((w) => (
              <div className="row" key={w.org}>
                <div>
                  <div className="row__main">{w.org}</div>
                  <div className="row__sub">{w.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
