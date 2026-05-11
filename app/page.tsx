"use client";

import { useEffect, useState } from "react";
import FormTransaksi from "./components/FormTransaksi";
import RekapTable from "./components/RekapTable";
import SummaryCard from "./components/SummaryCard";
import { Transaksi } from "@/types/transaksi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  FaPrint,
  FaFileExcel,
  FaDatabase,
  FaUpload,
} from "react-icons/fa";

export default function Home() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [logo, setLogo] = useState<string>("");

  const [editingData, setEditingData] =
    useState<Transaksi | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(
      "rekap-keuangan"
    );

    const savedLogo =
      localStorage.getItem("company-logo");

    if (saved) {
      const parsed = JSON.parse(saved);

      const fixedData = parsed.map(
        (item: Transaksi) => ({
          ...item,
          markup: item.markup || 0,
        })
      );

      setData(fixedData);
    }

    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "rekap-keuangan",
      JSON.stringify(data)
    );
  }, [data]);

  useEffect(() => {
    if (logo) {
      localStorage.setItem(
        "company-logo",
        logo
      );
    }
  }, [logo]);

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setLogo(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const addData = (item: Transaksi) => {
    setData([...data, item]);
  };

  const deleteData = (id: number) => {
    setData(
      data.filter((item) => item.id !== id)
    );
  };

  const updateData = (
    updated: Transaksi
  ) => {
    const newData = data.map((item) =>
      item.id === updated.id
        ? updated
        : item
    );

    setData(newData);

    setEditingData(null);
  };

  const totalBelanja = data.reduce(
    (a, b) => a + (b.belanja || 0),
    0
  );

  const subtotalCashbon = data.reduce(
    (a, b) => a + (b.cashbon || 0),
    0
  );

  const totalRekening = data.reduce(
    (a, b) => a + (b.cash || 0),
    0
  );

  const grandTotal =
    totalBelanja +
    subtotalCashbon +
    data.reduce(
      (a, b) => a + (b.lainnya || 0),
      0
    ) +
    data.reduce(
      (a, b) => a + (b.markup || 0),
      0
    );

  const addKopSurat = (doc: jsPDF) => {
    if (logo) {
      doc.addImage(
        logo,
        "PNG",
        10,
        10,
        18,
        18
      );
    }

    doc.setFontSize(18);

    doc.text(
      "PT. NATURAL PERSADA MANDIRI",
      105,
      15,
      {
        align: "center",
      }
    );

    doc.setFontSize(16);

    doc.text(
      "PT. ENERGI PRIMA SENTOSA",
      105,
      23,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);

    doc.text(
      "Jln. Trans Sulawesi, Desa Walasolo, Kec. Asera Kab. Konawe Utara, Prov. Sulawesi Tenggara",
      105,
      30,
      {
        align: "center",
      }
    );

    doc.text(
      "Telp: 082XXXXXXXX | Email: natural.persadamandiri25@gmail.com",
      105,
      36,
      {
        align: "center",
      }
    );

    doc.line(10, 42, 200, 42);
    doc.line(10, 43, 200, 43);
  };

 const printHarian = (
  item: Transaksi
) => {
  const doc = new jsPDF();

  addKopSurat(doc);

  doc.setFontSize(14);

  doc.text(
    "LAPORAN BELANJA HARIAN",
    105,
    55,
    {
      align: "center",
    }
  );

  doc.setFontSize(11);

  doc.text("Total Belanja", 14, 62);
doc.text(":", 55, 62);
doc.text(
  `Rp${totalBelanja.toLocaleString("id-ID")}`,
  60,
  62
);

doc.text("Subtotal Cashbon", 14, 68);
doc.text(":", 55, 68);
doc.text(
  `Rp${subtotalCashbon.toLocaleString("id-ID")}`,
  60,
  68
);

doc.text("Dalam Rekening", 14, 74);
doc.text(":", 55, 74);
doc.text(
  `Rp${totalRekening.toLocaleString("id-ID")}`,
  60,
  74
);

doc.text("Grand Total", 14, 80);
doc.text(":", 55, 80);
doc.text(
  `Rp${grandTotal.toLocaleString("id-ID")}`,
  60,
  80
);

  autoTable(doc, {
    startY: 88,

    head: [[
      "Tanggal",
      "Belanja",
      "Cashbon",
      "Lainnya",
      "Markup",
      "Saldo Akhir",
      "Dalam Rekening",
      "Total",
    ]],

    body: [[
      new Date(
        item.tanggal
      ).toLocaleDateString("id-ID"),

      (item.belanja || 0).toLocaleString(
        "id-ID"
      ),

      (item.cashbon || 0).toLocaleString(
        "id-ID"
      ),

      (item.lainnya || 0).toLocaleString(
        "id-ID"
      ),

      (item.markup || 0).toLocaleString(
        "id-ID"
      ),

      (item.saldoAkhir || 0).toLocaleString(
        "id-ID"
      ),

      (item.cash || 0).toLocaleString(
        "id-ID"
      ),

      (
        (item.belanja || 0) +
        (item.cashbon || 0) +
        (item.lainnya || 0) +
        (item.markup || 0)
      ).toLocaleString("id-ID"),
    ]],
  });

  doc.save(
    `laporan-${item.tanggal}.pdf`
  );
};

  const printBulanan = () => {
    const bulanIni =
      new Date().getMonth();

    const filtered = data.filter(
      (item) =>
        new Date(
          item.tanggal
        ).getMonth() === bulanIni
    );

    const doc = new jsPDF();

    addKopSurat(doc);

    doc.setFontSize(14);

    doc.text(
      "LAPORAN BULANAN",
      105,
      55,
      {
        align: "center",
      }
    );

    autoTable(doc, {
      startY: 65,

      head: [[
        "Tanggal",
        "Belanja",
        "Cashbon",
        "Lainnya",
        "Markup",
        "Saldo Akhir",
        "Dalam Rekening",
      ]],

      body: filtered.map((item) => [
        new Date(
          item.tanggal
        ).toLocaleDateString("id-ID"),

        (item.belanja || 0).toLocaleString(
          "id-ID"
        ),

        (item.cashbon || 0).toLocaleString(
          "id-ID"
        ),

        (item.lainnya || 0).toLocaleString(
          "id-ID"
        ),

        (item.markup || 0).toLocaleString(
          "id-ID"
        ),

        (item.saldoAkhir || 0).toLocaleString(
          "id-ID"
        ),

        (item.cash || 0).toLocaleString(
          "id-ID"
        ),
      ]),
    });

    doc.save("laporan-bulanan.pdf");
  };

  const exportExcel = () => {
    const excelData = data.map(
      (item) => ({
        Tanggal: new Date(
          item.tanggal
        ).toLocaleDateString("id-ID"),

        Belanja: item.belanja || 0,

        Cashbon: item.cashbon || 0,

        Lainnya: item.lainnya || 0,

        Markup: item.markup || 0,

        "Saldo Akhir":
          item.saldoAkhir || 0,

        "Dalam Rekening":
          item.cash || 0,

        Total:
          (item.belanja || 0) +
          (item.cashbon || 0) +
          (item.lainnya || 0) +
          (item.markup || 0),
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Laporan"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const fileData = new Blob(
      [excelBuffer],
      {
        type: "application/octet-stream",
      }
    );

    saveAs(
      fileData,
      "laporan-keuangan.xlsx"
    );
  };

  const exportJSON = () => {
    const backupData = {
      transaksi: data,
      logo,
    };

    const dataStr = JSON.stringify(
      backupData,
      null,
      2
    );

    const blob = new Blob([dataStr], {
      type: "application/json",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "backup-rekap-keuangan.json";

    link.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result =
          event.target?.result;

        if (
          typeof result === "string"
        ) {
          const parsed =
            JSON.parse(result);

          if (parsed.transaksi) {
            setData(parsed.transaksi);
          }

          if (parsed.logo) {
            setLogo(parsed.logo);
          }

          alert(
            "Backup berhasil dipulihkan"
          );
        }
      } catch (error) {
        alert(
          "File backup tidak valid"
        );
      }
    };

    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-gray-500 p-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-5">
          Rekap Keuangan
        </h1>

        <SummaryCard
          totalBelanja={totalBelanja}
          subtotalCashbon={subtotalCashbon}
          totalRekening={totalRekening}
          grandTotal={grandTotal}
        />

        <div className="bg-amber-100 p-5 rounded-xl shadow-lg">
          <div className="flex gap-3 mb-4 flex-wrap">

            <label className="bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer">
              Upload Logo

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleLogoUpload
                }
              />
            </label>

            <button
              onClick={exportJSON}
              className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaDatabase />
              Backup Data
            </button>

            <label className="bg-orange-600 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
              <FaUpload />
              Restore Data

              <input
                type="file"
                accept=".json"
                hidden
                onChange={importJSON}
              />
            </label>

            <button
              onClick={printBulanan}
              className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPrint />
              Print Bulanan
            </button>

            <button
              onClick={exportExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel />
              Export Excel
            </button>
          </div>

          <FormTransaksi
            onAdd={addData}
            editingData={editingData}
            onUpdate={updateData}
            saldoTerakhir={
              data.length > 0
                ? data[
                    data.length - 1
                  ].saldoAkhir
                : 0
            }
          />

          <RekapTable
            data={data}
            onDelete={deleteData}
            onEdit={setEditingData}
            onPrint={printHarian}
          />
        </div>
      </div>
    </main>
  );
}