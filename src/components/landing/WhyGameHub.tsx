import React from 'react';
import { DownloadCloud, Rocket, Smartphone, ShieldCheck, Database, Zap } from 'lucide-react';

export const WhyGameHub: React.FC = () => {
  const features = [
    {
      icon: DownloadCloud,
      title: 'Real APK Cloud Distribution',
      description:
        'Every published title links directly to authentic Android APK binaries stored in dedicated Supabase Storage buckets. No link shorteners, no deceptive redirect chains, no forced countdown timers.',
    },
    {
      icon: Rocket,
      title: 'Instant Publishing Pipeline',
      description:
        'Game developers and studios can upload an APK, high-resolution screenshots, icon, and description to launch an automatic dedicated landing page in under 60 seconds.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Experience',
      description:
        'Designed specifically for handheld Android devices and tablets. Native gesture-friendly screenshot carousels, responsive touch targets, and single-tap direct installations.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Safe Package Archive',
      description:
        'Every uploaded APK package undergoes automated file structure verification, manifest integrity validation, and size calculation before public release.',
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 border-t border-neutral-850 bg-neutral-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            Why GameHub
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Android Players and Independent Game Studios
          </h3>
          <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
            The simplest, most transparent platform for distributing high-performance Android mobile games with zero platform lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
