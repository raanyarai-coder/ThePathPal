import React from 'react';
import { Shield, Lock, UserX, Award, Clock, HeartHandshake } from 'lucide-react';

export const ResponsibleDesign: React.FC = () => {
  const principles = [
    {
      title: 'Safety',
      icon: Shield,
      color: 'bg-companion-coral/10 text-companion-coral border-companion-coral/20',
      description: 'Comprehensive background screening, HIPAA compliance training, de-escalation protocols, and immediate incident reporting pathways.',
    },
    {
      title: 'Privacy',
      icon: Lock,
      color: 'bg-navigation-teal/10 text-navigation-teal border-navigation-teal/20',
      description: 'Strict data minimization, encrypted access, patient consent safeguards, and compliance with healthcare privacy regulations.',
    },
    {
      title: 'Role clarity',
      icon: UserX,
      color: 'bg-warm-gold/20 text-pathpal-navy border-warm-gold/30',
      description: 'Pals are explicitly non-clinical companions. They provide navigation and empathetic accompaniment, never medical advice or treatment.',
    },
    {
      title: 'Quality',
      icon: Award,
      color: 'bg-companion-coral/10 text-companion-coral border-companion-coral/20',
      description: 'Standardized onboarding training, visit checklists, post-visit 5-star ratings, and ongoing companion coaching.',
    },
    {
      title: 'Availability',
      icon: Clock,
      color: 'bg-navigation-teal/10 text-navigation-teal border-navigation-teal/20',
      description: 'Controlled matching capacity to prevent burnout, paired with transparent real-time status tracking for patients and families.',
    },
  ];

  return (
    <section className="py-20 bg-pathpal-navy text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-soft-rose text-xs font-bold uppercase tracking-wider border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            <span>RESPONSIBLE DESIGN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Trust is part of the product
          </h2>
          <p className="text-base text-gray-300">
            Designed from the ground up with patient safety, privacy, and non-clinical role clarity.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="bg-white/10 backdrop-blur-xs p-6 rounded-3xl border border-white/10 space-y-3 hover:bg-white/15 transition-colors">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${p.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-soft-rose">{p.title}</h3>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
