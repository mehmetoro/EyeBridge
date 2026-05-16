# EyeBridge Katki Rehberi

EyeBridge topluluk projesidir. Kod yazmasan bile katkida bulunabilirsin.

## Katki Turleri

- Hata bildirimi
- Ozellik onerisi
- Ekran goruntusu/video ile kullanim testi
- Dokumantasyon duzeltme
- Kod katkisi

## Issue Acma

Issue acarken sunlari ekle:

- Ne bekliyordun?
- Ne oldu?
- Tekrar etmek icin adimlar
- Mumkunse ekran goruntusu/video

## Branch ve PR Akisi

1. `main` uzerinden yeni branch ac.
2. Degisikligi kucuk ve tek amacli tut.
3. Aciklayici commit mesaji yaz.
4. PR ac ve degisikligi net anlat.

## Kod Standartlari

- Goz tabanli etkilesim kurallarina uy:
- Tum etkilesimli elementlerde `data-gaze="true"` olsun.
- Kirpma ile calisacaklarda `data-blink-action="true"` olsun.
- Tus boyutu en az 80x80 px, aralik en az 20 px olsun.
- Metin en az 28 px, baslik en az 48 px olsun.

## Etkilesim Standardi Zorunlulugu

- Yeni ekran, modül, sosyal akis veya oyun gelistirmeden once [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md) okunmali.
- Standart sayfa bolgeleri bozulmamali.
- Sticky focus mantigi disina cikilmamali.
- Baglama ozel kalibrasyon gerekiyorsa mevcut profil yapisi kullanilmali.
- Ozellikle oyun gelistiren katkicilar, oyunun gaze ile tam kullanilabilir oldugunu ve standart gezinme mantigini bozmadigini gostermelidir.

## Cok Dilli Zorunluluk

- Disa acik tum sayfalar `tr`, `en`, `de`, `es`, `fr`, `ru` dillerinde hazirlanmalidir.
- Yeni bir sayfa veya modül ekleniyorsa 6 dilde sabit metinler ayni PR icinde eklenmelidir.
- Oyun arayuzleri ve sosyal modullerdeki sabit UI metinleri de bu kurala dahildir.
- Gelistiriciye yonelik dokumanlar ve plan dosyalari Turkce ve Ingilizce tutulmalidir.

## Guvenlik ve Gizlilik

- Hassas hasta verilerini asla depoya ekleme.
- Gercek kimlik bilgisi/ic veri ile test yapma.

## Iletisim

Tum gelistirme tartismalari GitHub Issues ve Pull Request yorumlarinda tutulur.

---

# EyeBridge Contribution Guide

EyeBridge is a community project. You can still contribute even if you are not writing code.

## Contribution Types

- bug reports
- feature proposals
- usage tests with screenshots or videos
- documentation fixes
- code contributions

## Required Standards

- Read [docs/INTERACTION_STANDARD.md](docs/INTERACTION_STANDARD.md) before building a new page, social flow, or game.
- Do not break the standard page zones.
- Do not bypass sticky focus behavior.
- Use the existing profile-based calibration model when a context-specific calibration is needed.

## Language Requirement

- Public-facing pages must ship in `tr`, `en`, `de`, `es`, `fr`, and `ru`.
- Fixed UI text for games and social modules must also ship in all six languages.
- Developer-facing documents and plan files must remain bilingual in Turkish and English.
