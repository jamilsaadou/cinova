import { useTranslations } from "next-intl";

export function AttachmentCard({ attachment }: {
  attachment: { id: string; filename: string; mimeType: string; size: number };
}) {
  const t = useTranslations("files");
  const url = `/api/attachments/${attachment.id}`;
  return (
    <div className="overflow-hidden rounded-xl border border-sand bg-cream-50">
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${t("open")} : ${attachment.filename}`}>
        {attachment.mimeType === "application/pdf" ? (
          <div className="flex aspect-video items-center justify-center bg-green/10 text-2xl font-bold text-green">PDF</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={attachment.filename} loading="lazy" className="aspect-video w-full object-contain" />
        )}
      </a>
      <div className="space-y-2 p-3 text-xs">
        <p className="break-all font-medium text-forest">{attachment.filename}</p>
        <p className="text-muted">{Math.ceil(attachment.size / 1024)} KB</p>
        <div className="flex flex-wrap gap-3 text-green">
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">{t("open")}</a>
          <a href={`${url}?download=1`} className="underline">{t("download")}</a>
        </div>
      </div>
    </div>
  );
}
