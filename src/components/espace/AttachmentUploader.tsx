"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  uploadAttachmentAction,
  deleteAttachmentAction,
  type FormState,
} from "@/lib/candidature-actions";
import { IconDownload } from "@/components/icons";

type Att = { id: string; filename: string };
type Preview = { url: string; name: string };
const initial: FormState = { status: "idle" };

export function AttachmentUploader({
  attachments,
  locked,
}: {
  attachments: Att[];
  locked?: boolean;
}) {
  const t = useTranslations("espace.projet");
  const te = useTranslations("espace.projet.errors");
  const locale = useLocale();
  const [state, action, pending] = useActionState(uploadAttachmentAction, initial);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Aperçus locaux dès la sélection des fichiers.
  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
  }

  useEffect(() => {
    if (state.status === "success") {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  return (
    <div>
      {/* Images déjà téléversées */}
      {attachments.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((a) => (
            <li key={a.id} className="group relative overflow-hidden rounded-xl border border-sand bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/attachments/${a.id}`}
                alt={a.filename}
                className="aspect-video w-full object-cover"
              />
              {!locked && (
                <form action={deleteAttachmentAction} className="absolute right-1.5 top-1.5">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="attachmentId" value={a.id} />
                  <button
                    className="rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                    title={t("removeImage")}
                  >
                    ✕
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        previews.length === 0 && <p className="text-sm text-muted">{t("noImages")}</p>
      )}

      {!locked && (
        <form ref={formRef} action={action} className="mt-4">
          <input
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            required
            onChange={onSelect}
            className="block w-full text-sm text-ink file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-green/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green hover:file:bg-green/20"
          />

          {/* Aperçu des miniatures sélectionnées */}
          {previews.length > 0 && (
            <>
              <p className="mt-3 text-xs font-medium text-muted">{t("selectedPreview")}</p>
              <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {previews.map((p, i) => (
                  <li key={i} className="overflow-hidden rounded-xl border border-green/40 bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="aspect-video w-full object-cover" />
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending || previews.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest disabled:opacity-60"
            >
              <IconDownload className="h-4 w-4 rotate-180" />
              {pending ? t("uploading") : t("uploadBtn")}
            </button>
            {state.status === "error" && state.error && (
              <p className="text-xs text-red-600">{te(state.error)}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
