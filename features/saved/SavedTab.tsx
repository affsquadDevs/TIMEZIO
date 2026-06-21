import { useTranslations } from 'next-intl';
import ui from '@/components/ui/ui.module.css';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { LocationCard } from '@/components/ui/LocationCard';

export function SavedTab() {
  const t = useTranslations('ui.savedTab');
  const { showToast } = useToast();
  const savedIds = useAppStore((s) => s.savedIds);
  const locationsById = useAppStore((s) => s.locationsById);
  const removeSaved = useAppStore((s) => s.removeSaved);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const addToCompare = useAppStore((s) => s.addToCompare);

  const saved = savedIds.map((id) => locationsById[id]).filter(Boolean);

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>{t('title')}</div>
          <div className={ui.subtitle}>{t('subtitle')}</div>
        </div>

        {saved.length === 0 ? (
          <div className={ui.subtitle}>{t('emptyState')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {saved.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                actions={
                  <div className={ui.pillRow}>
                    <button
                      className={ui.btn}
                      onClick={() => {
                        selectLocation(loc.id);
                        requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
                      }}
                    >
                      {t('select')}
                    </button>
                    <button
                      className={ui.btn}
                      onClick={() => {
                        const res = addToCompare(loc.id);
                        if (!res.ok && res.reason) showToast(res.reason, 'error');
                      }}
                    >
                      {t('compare')}
                    </button>
                    <button className={`${ui.btn} ${ui.btnDanger}`} onClick={() => removeSaved(loc.id)}>
                      {t('remove')}
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


