import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";

type HeroSectionProps = {
  title: string;
  subtitle?: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  bannerSrc?: string;
};

export function HeroSection({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  bannerSrc,
}: HeroSectionProps) {
  const hasBanner = Boolean(bannerSrc);

  return (
    <section
      className={
        hasBanner
          ? "relative overflow-hidden py-16 sm:py-24"
          : "bg-brand-50 py-16 sm:py-24"
      }
    >
      {hasBanner && bannerSrc && (
        <>
          <Image
            src={bannerSrc}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-900/70 to-brand-900/30"
            aria-hidden
          />
        </>
      )}

      <Container className={hasBanner ? "relative z-10" : undefined}>
        <div className="max-w-3xl">
          {subtitle && (
            <p
              className={
                hasBanner
                  ? "mb-3 text-sm font-medium uppercase tracking-wider text-accent-light"
                  : "mb-3 text-sm font-medium uppercase tracking-wider text-accent"
              }
            >
              {subtitle}
            </p>
          )}
          <h1
            className={
              hasBanner
                ? "text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                : "text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl"
            }
          >
            {title}
          </h1>
          <p
            className={
              hasBanner
                ? "mt-6 text-lg leading-relaxed text-brand-100"
                : "mt-6 text-lg leading-relaxed text-brand-600"
            }
          >
            {description}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={
                    hasBanner
                      ? "inline-flex items-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/20"
                      : "inline-flex items-center rounded-md border border-brand-300 bg-white px-6 py-3 text-sm font-medium text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  }
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
