import classNames from 'classnames';
import { useCallback } from 'react';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useCountryNames, useLocale, useMessages } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import styles from './RealtimeCountries.module.css';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);

  const renderCountryName = useCallback(
    data => (
      <span className={classNames(styles.row)}>
        <TypeIcon type="country" value={data.label} />
        {countryNames[data.label]}
      </span>
    ),
    [countryNames, locale],
  );

  return (
    <ListTable
      title={formatMessage(labels.countries)}
      metric={formatMessage(labels.visitors)}
      data={data}
      renderLabel={renderCountryName}
    />
  );
}
