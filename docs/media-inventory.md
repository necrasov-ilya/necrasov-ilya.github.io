# Media Inventory

## Current assets

The repository now has both working assets and source media for the future hero:

- `src/assets/branding/logotypes/nksv-logotype.svg`
- `src/assets/branding/marks/nksv-mark-avatar.svg`
- `src/assets/media/portraits/ilya-portrait.png`
- `media-source/hero/gifs/light/hero-light-01-source.gif`
- `media-source/hero/gifs/light/hero-light-02-source.gif`
- `media-source/hero/gifs/dark/hero-dark-01-source.gif`
- `media-source/hero/gifs/dark/hero-dark-02-source.gif`
- `public/media/hero/logo/logo-nksv-filled.svg`
- `public/media/hero/logo/logo-nksv-outline.svg`
- `public/media/hero/logo/logo-nksv-mark-filled.svg`
- `public/media/hero/logo/logo-nksv-mark-outlined.svg`
- `public/media/hero/intro/desktop/hero-intro-light-01.webm`
- `public/media/hero/intro/desktop/hero-intro-light-02.webm`
- `public/media/hero/intro/desktop/hero-intro-light-03.webm`
- `public/media/hero/intro/desktop/hero-intro-dark-01.webm`
- `public/media/hero/intro/desktop/hero-intro-dark-02.webm`
- `public/media/hero/intro/desktop/hero-intro-dark-03.webm`
- `public/media/hero/stills/light/hero-still-light-01.webp`
- `public/media/hero/stills/light/hero-still-light-02.webp`
- `public/media/hero/stills/light/hero-still-light-03.webp`
- `public/media/hero/stills/dark/hero-still-dark-01.webp`
- `public/media/hero/stills/dark/hero-still-dark-02.webp`
- `public/media/hero/stills/dark/hero-still-dark-03.webp`

## Hero media architecture

The hero section is prepared to receive media in this structure:

- `media-source/hero/gifs/light`
- `media-source/hero/gifs/dark`
- `public/media/hero/intro/desktop`
- `public/media/hero/intro/mobile`
- `public/media/hero/stills/light`
- `public/media/hero/stills/dark`
- `public/media/hero/logo`

## Intended usage

- `intro/desktop`: short desktop intro loops or one-shot clips in `webm/mp4`
- `intro/mobile`: vertical or cropped intro versions for touch devices
- `stills/light`: bright post-intro frames
- `stills/dark`: dark post-intro frames
- `logo`: hero-specific logo exports such as `filled`, `outline`, `mask` or alternate lockups

## Current gap

These folders are still waiting for more content:

- mobile intro clips
- additional light stills
- additional dark stills
- alternate hero logo exports if needed

## Naming rule

Use descriptive names with role first:

- `hero-light-03-source.gif`
- `hero-dark-03-source.gif`
- `hero-intro-light-03.webm`
- `hero-intro-dark-03.webm`
- `hero-still-light-03.avif`
- `hero-still-dark-03.avif`
- `logo-nksv-filled.svg`
- `logo-nksv-outline.svg`
