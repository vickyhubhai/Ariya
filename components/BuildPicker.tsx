'use client';

import { useRelease } from '@/lib/release-context';
import { formatSize, variantDesc, variantInfo } from '@/lib/utils';

/**
 * "Choose your build" picker. Same rule as the static site: with fewer than two
 * APKs there is nothing to choose, so the panel is not rendered at all.
 */
export default function BuildPicker() {
  const { release, apkAssets, selected, recommended, selectVariant } = useRelease();

  if (apkAssets.length < 2) return null;

  return (
    <div className="apk-variants" id="apk-variants">
      <div className="variants-title">Choose your build</div>
      <div className="variants-sub" id="variants-sub">
        All builds are the latest <strong>{release?.version ?? 'release'}</strong> release &mdash; same app, different packaging.
      </div>

      <div className="variants-grid" id="variants-grid" role="radiogroup" aria-label="APK build to download">
        {apkAssets.map((asset) => {
          const info = variantInfo(asset.name);
          const isSelected = selected?.name === asset.name;
          return (
            <button
              key={asset.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`variant-card${isSelected ? ' selected' : ''}`}
              data-name={asset.name}
              onClick={() => selectVariant(asset.name)}
            >
              <span className="variant-head">
                <span className="variant-name">
                  {info.flavor} &middot; {info.arch}
                </span>
                <span className="variant-check" aria-hidden="true" />
              </span>
              <span className="variant-desc">{variantDesc(info)}</span>
              <span className="variant-meta">
                <span className="variant-size">{asset.size ? formatSize(asset.size) : 'Size unknown'}</span>
                {recommended?.name === asset.name ? <span className="variant-badge">Recommended</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="variants-hint">
        Not sure? <strong>Universal</strong> works on every device. <strong>ARM64</strong> is smaller and fits most modern phones.{' '}
        <strong>FOSS</strong> does not need Google services.
      </div>
    </div>
  );
}
