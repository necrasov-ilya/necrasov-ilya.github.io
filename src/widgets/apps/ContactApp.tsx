import { profile } from '../../entities/application/model/profile';

export function ContactApp() {
  return (
    <div className="app-pane app-pane--contact">
      <section className="contact-hero">
        <div className="eyebrow">CONTACT / READY TO SHIP</div>
        <h2>Если нужен ML-проект с сильным интерфейсом, можно написать сюда.</h2>
        <p>
          Предпочитаю разговоры, где уже есть продуктовая задача, ограничения и желание довести
          ощущение от продукта до высокого уровня, а не просто “сделать страницу”.
        </p>
      </section>

      <div className="contact-list">
        {profile.links.map((link) => (
          <a className="contact-card" href={link.href} key={link.label} rel="noreferrer" target="_blank">
            <span>{link.label}</span>
            <strong>{link.value}</strong>
          </a>
        ))}
        <a
          className="contact-card"
          href="https://github.com/necrasov-ilya/necrasov-ilya.github.io"
          rel="noreferrer"
          target="_blank"
        >
          <span>Repo</span>
          <strong>desktop portfolio source</strong>
        </a>
      </div>
    </div>
  );
}
