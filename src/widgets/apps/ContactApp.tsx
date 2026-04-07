import { profile } from '../../entities/application/model/profile';

export function ContactApp() {
  return (
    <div className="app-pane app-pane--contact">
      <section className="contact-hero">
        <div className="eyebrow">КОНТАКТЫ / НА СВЯЗИ</div>
        <h2>Если нужен ML-продукт с сильным интерфейсом, можно написать сюда.</h2>
        <p>
          Больше всего ценю разговоры, где уже есть продуктовая задача, ограничения и желание
          довести ощущение от сервиса до высокого уровня, а не просто “сделать страницу” или
          “воткнуть модель”.
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
          <span>Исходники</span>
          <strong>desktop portfolio source</strong>
        </a>
      </div>
    </div>
  );
}
