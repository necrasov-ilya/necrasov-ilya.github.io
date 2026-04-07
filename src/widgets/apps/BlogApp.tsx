import { useEffect, useRef, useState } from 'react';
import { blogPosts, telegramChannelUrl } from '../../entities/content/model/blog';

export function BlogApp() {
  const [selectedId, setSelectedId] = useState(blogPosts[0]?.id ?? '');
  const sidebarRef = useRef<HTMLElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const activePost = blogPosts.find((post) => post.id === selectedId) ?? blogPosts[0];

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    sidebarRef.current?.scrollTo({ top: 0 });
    articleRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  if (blogPosts.length === 0) {
    return (
      <div className="app-pane">
        <section className="empty-card">
          <div className="eyebrow">BLOG / OFFLINE</div>
          <h2>Посты пока недоступны</h2>
          <p>Локальный слепок Telegram-канала не найден. Запусти sync-контент и открой окно снова.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-pane app-pane--blog">
      <aside className="blog-sidebar" ref={sidebarRef}>
        <div className="blog-sidebar__head">
          <div className="eyebrow">БЛОГ / КАНАЛ</div>
          <h2>Разборы, заметки и длинные посты</h2>
          <p>
            Лента собирается из канала, изображения сохраняются локально, поэтому окно работает как
            статическое приложение, а не как внешняя встройка.
          </p>
          <a className="ghost-button blog-channel-link" href={telegramChannelUrl} rel="noreferrer" target="_blank">
            Открыть канал
          </a>
        </div>

        <div className="blog-list">
          {blogPosts.map((post) => (
            <button
              className={`blog-card ${post.id === activePost.id ? 'is-active' : ''}`}
              key={post.id}
              onClick={() => setSelectedId(post.id)}
              type="button"
            >
              {post.image ? (
                <img alt={post.title} className="blog-card__image" src={post.image} />
              ) : (
                <div className="blog-card__placeholder">Текст</div>
              )}
              <div className="blog-card__copy">
                <div className="blog-card__meta">
                  <span>{post.publishedLabel}</span>
                  <span>{post.readLabel}</span>
                </div>
                <strong>{post.title}</strong>
                {post.previewExcerpt ? <p>{post.previewExcerpt}</p> : null}
                <div className="blog-card__tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <article className="blog-article" ref={articleRef}>
        <div className="blog-article__head">
          <div className="eyebrow">СТАТЬЯ / ЧТЕНИЕ</div>
          <h2>{activePost.title}</h2>
          <div className="blog-article__meta">
            <span>{activePost.publishedLabel}</span>
            <span>{activePost.readLabel}</span>
          </div>
        </div>

        {activePost.image && (
          <figure className="blog-article__image">
            <img alt={activePost.title} src={activePost.image} />
          </figure>
        )}

        <div className="blog-article__body">
          {activePost.paragraphs.map((paragraph, index) => (
            <p key={`${activePost.id}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="blog-article__footer">
          <div className="blog-card__tags">
            {activePost.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <a className="ghost-button" href={activePost.link} rel="noreferrer" target="_blank">
            Читать в Telegram
          </a>
        </div>
      </article>
    </div>
  );
}
