import { Flag } from '@/localization/Flag';

type LanguageOptionProps = {
  nativeName: string;
  countryCode: string;
};

export function LanguageOption({
  nativeName,
  countryCode,
}: LanguageOptionProps) {
  return (
    <>
      <Flag
        countryCode={countryCode}
        aria-hidden="true"
        className="size-4 shrink-0"
      />
      {nativeName}
    </>
  );
}
