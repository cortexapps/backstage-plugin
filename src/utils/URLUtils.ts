import { StringifiableRecord, stringifyUrl } from 'query-string';

export const buildUrl = (
  queryParamsObj: StringifiableRecord,
  pathname: string,
) =>
  `${window.location.origin}${stringifyUrl({
    url: pathname,
    query: queryParamsObj,
  })}`;
