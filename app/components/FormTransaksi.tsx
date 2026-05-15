"use client";

import { useEffect, useState } from "react";
import { Transaksi } from "@/types/transaksi";

interface Props {
  onAdd: (data: Transaksi) => void;
  editingData: Transaksi | null;
  onUpdate: (data: Transaksi) => void;
  saldoTerakhir: number;
}

export default function FormTransaksi({
  onAdd,
  editingData,
  onUpdate,
  saldoTerakhir,
}: Props) {

  const [form, setForm] = useState({
  tanggal: "",
  danaTambahan: "",
  belanja: "",
  cashbon: "",
  lainnya: "",
  markup: "",
  cash: "",
  keterangan: "",
});

  useEffect(() => {
    if (editingData) {
      setForm({
        tanggal: editingData.tanggal,

        danaTambahan: "",

        belanja: new Intl.NumberFormat(
          "id-ID"
        ).format(
          editingData.belanja || 0
        ),

        cashbon: new Intl.NumberFormat(
          "id-ID"
        ).format(
          editingData.cashbon || 0
        ),

        lainnya: new Intl.NumberFormat(
          "id-ID"
        ).format(
          editingData.lainnya || 0
        ),

        markup: new Intl.NumberFormat(
          "id-ID"
        ).format(
          editingData.markup || 0
        ),

        cash: new Intl.NumberFormat(
          "id-ID"
        ).format(
          editingData.cash || 0
        ),

        keterangan:
          editingData.keterangan || "",
      });
    }
  }, [editingData]);

  const formatNumber = (
    value: string
  ) => {
    const number = value.replace(
      /\D/g,
      ""
    );

    if (!number) return "";

    return new Intl.NumberFormat(
      "id-ID"
    ).format(Number(number));
  };

  const parseNumber = (
    value: string
  ) => {
    return Number(
      value.replace(/\./g, "")
    );
  };

  const danaTambahanPreview =
    parseNumber(
      form.danaTambahan || "0"
    );

  const saldoAwalPreview =
    saldoTerakhir +
    danaTambahanPreview;

    const handleSubmit = (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (!form.tanggal) {
        alert(
          "Tanggal wajib diisi"
        );

        return;
      }

      if (
        !form.belanja ||
        parseNumber(form.belanja) <= 0
      ) {
        alert(
          "Belanja wajib diisi"
        );

        return;
      }

      const danaTambahan =
        parseNumber(
          form.danaTambahan
        );

      const saldoAwal =
        editingData
          ? editingData.saldoAwal +
            danaTambahan
          : saldoTerakhir +
            danaTambahan;

      const belanja =
        parseNumber(form.belanja);

      const cashbon =
        parseNumber(form.cashbon);

      const lainnya =
        parseNumber(form.lainnya);

      const markup =
        parseNumber(form.markup);

      const cash =
        parseNumber(form.cash);

      const saldoAkhir =
        saldoAwal -
        belanja -
        cashbon -
        lainnya -
        markup;

      const newData: Transaksi = {
        id: editingData
          ? editingData.id
          : Date.now(),

        tanggal: form.tanggal,

        saldoAwal,

        belanja,

        cashbon,

        lainnya,

        markup,

        saldoAkhir,

        cash,

        keterangan:
          form.keterangan,
      };

      if (editingData) {
        onUpdate(newData);
      } else {
        onAdd(newData);
      }

      setForm({
        tanggal: "",
        danaTambahan: "",
        belanja: "",
        cashbon: "",
        lainnya: "",
        markup: "",
        cash: "",
        keterangan: "",
      });
    };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid md:grid-cols-3 gap-3 mb-6 text-black"
    >

      <div className="border p-2 rounded bg-gray-200">
        <p className="text-sm text-gray-700">
          Saldo Awal Otomatis
        </p>

        <p className="font-bold text-lg">
          Rp
          {saldoAwalPreview.toLocaleString(
            "id-ID"
          )}
        </p>
      </div>

      <input
        type="date"
        className="border p-2 rounded"
        value={form.tanggal}
        onChange={(e) =>
          setForm({
            ...form,
            tanggal:
              e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Dana Tambahan"
        className="border p-2 rounded"
        value={form.danaTambahan}
        onChange={(e) =>
          setForm({
            ...form,
            danaTambahan:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <input
        type="text"
        placeholder="Belanja"
        className="border p-2 rounded"
        value={form.belanja}
        onChange={(e) =>
          setForm({
            ...form,
            belanja:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <input
        type="text"
        placeholder="Cashbon"
        className="border p-2 rounded"
        value={form.cashbon}
        onChange={(e) =>
          setForm({
            ...form,
            cashbon:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <input
        type="text"
        placeholder="Keperluan Lainnya"
        className="border p-2 rounded"
        value={form.lainnya}
        onChange={(e) =>
          setForm({
            ...form,
            lainnya:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <input
        type="text"
        placeholder="Markup"
        className="border p-2 rounded"
        value={form.markup}
        onChange={(e) =>
          setForm({
            ...form,
            markup:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <input
        type="text"
        placeholder="Dalam Rekening"
        className="border p-2 rounded"
        value={form.cash}
        onChange={(e) =>
          setForm({
            ...form,
            cash:
              formatNumber(
                e.target.value
              ),
          })
        }
      />

      <textarea
        placeholder="Keterangan / Catatan"
        className="border p-2 rounded md:col-span-2 min-h-30"
        value={form.keterangan}
        onChange={(e) => {
          const lines = e.target.value
            .split("\n")
            .map((line, index) => {
              const clean = line.replace(
                /^\d+\.\s*/,
                ""
              );

              return clean
                ? `${index + 1}. ${clean}`
                : "";
            });

          setForm({
            ...form,
            keterangan:
              lines.join("\n"),
          });
        }}
      />

      <button className="bg-blue-300 text-black rounded p-2 hover:bg-blue-700">
        {editingData
          ? "Update Data"
          : "Tambah Data"}
      </button>

    </form>
  );
}
