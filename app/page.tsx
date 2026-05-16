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

    const [catatanEdit, setCatatanEdit] =
  useState("");

const [selectedCatatanId, setSelectedCatatanId] =
  useState<number | null>(null);

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

  const updateCatatan = () => {

  if (!selectedCatatanId) return;

  const updated = data.map((item) => {

    if (item.id === selectedCatatanId) {

      return {
        ...item,
        keterangan: catatanEdit,
      };
    }

    return item;
  });

  setData(updated);

  setSelectedCatatanId(null);

  setCatatanEdit("");

  alert("Catatan berhasil diupdate");
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

  doc.text(
    "Total Belanja",
    14,
    62
  );

  doc.text(
    ":",
    55,
    62
  );

  doc.text(
    `Rp${totalBelanja.toLocaleString("id-ID")}`,
    60,
    62
  );

  doc.text(
    "Subtotal Cashbon",
    14,
    68
  );

  doc.text(
    ":",
    55,
    68
  );

  doc.text(
    `Rp${subtotalCashbon.toLocaleString("id-ID")}`,
    60,
    68
  );

doc.text(
    "Subtotal Lainnya",
    14,
    74
  );

  doc.text(
    ":",
    55,
    74
  );

  doc.text(
    `Rp${data
      .reduce(
        (a, b) =>
          a +
          (b.lainnya || 0),
        0
      )
      .toLocaleString("id-ID")}`,
    60,
    74
  );

  doc.text(
    "Grand Total",
    14,
    80
  );

  doc.text(
    ":",
    55,
    80
  );

  doc.text(
    `Rp${grandTotal.toLocaleString("id-ID")}`,
    60,
    80
  );

  autoTable(doc, {
    startY: 88,

    head: [[
      "Tanggal",
      "Saldo Awal",
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
  ).toLocaleDateString(
    "id-ID"
  ),

  (
    item.saldoAwal || 0
  ).toLocaleString(
    "id-ID"
  ),

  (
    item.belanja || 0
  ).toLocaleString(
    "id-ID"
  ),

      (
        item.cashbon || 0
      ).toLocaleString(
        "id-ID"
      ),

      (
        item.lainnya || 0
      ).toLocaleString(
        "id-ID"
      ),

      (
        item.markup || 0
      ).toLocaleString(
        "id-ID"
      ),

      (
        item.saldoAkhir || 0
      ).toLocaleString(
        "id-ID"
      ),

      (
        item.cash || 0
      ).toLocaleString(
        "id-ID"
      ),

      (
        (item.belanja || 0) +
        (item.cashbon || 0) +
        (item.lainnya || 0) +
        (item.markup || 0)
      ).toLocaleString(
        "id-ID"
      ),

    ]],
  });

  const finalY =
    (doc as any)
      .lastAutoTable
      .finalY || 120;

  doc.setFontSize(11);

  doc.text(
    "Catatan:",
    14,
    finalY + 10
  );

  const catatan =
    item.keterangan
      ?.split("\n")
      .filter(
        (line) =>
          line.trim()
      );

  let yPos =
    finalY + 18;

  catatan?.forEach(
    (line, index) => {

      const cleanText =
        line.replace(
          /^\d+\.\s*/,
          ""
        );

      doc.text(
        `${index + 1}.`,
        14,
        yPos
      );

      const wrappedText =
        doc.splitTextToSize(
          cleanText,
          160
        );

      doc.text(
        wrappedText,
        24,
        yPos
      );

      yPos +=
        wrappedText.length * 7;

    }
  );

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
      ).getMonth() ===
      bulanIni
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

  doc.setFontSize(11);

  doc.text(
    "Total Belanja",
    14,
    62
  );

  doc.text(
    ":",
    55,
    62
  );

  doc.text(
    `Rp${totalBelanja.toLocaleString("id-ID")}`,
    60,
    62
  );

  doc.text(
    "Subtotal Cashbon",
    14,
    68
  );

  doc.text(
    ":",
    55,
    68
  );

  doc.text(
    `Rp${subtotalCashbon.toLocaleString("id-ID")}`,
    60,
    68
  );

  doc.text(
    "Subtotal Lainnya",
    14,
    74
  );

  doc.text(
    ":",
    55,
    74
  );

  doc.text(
    `Rp${data
      .reduce(
        (a, b) =>
          a +
          (b.lainnya || 0),
        0
      )
      .toLocaleString("id-ID")}`,
    60,
    74
  );

  doc.text(
    "Grand Total",
    14,
    80
  );

  doc.text(
    ":",
    55,
    80
  );

  doc.text(
    `Rp${grandTotal.toLocaleString("id-ID")}`,
    60,
    80
  );

  autoTable(doc, {
    startY: 88,

    head: [[
      "Tanggal",
      "Saldo Awal",
      "Belanja",
      "Cashbon",
      "Lainnya",
      "Markup",
      "Saldo Akhir",
      "Dalam Rekening",
      "Total",
    ]],

   body: filtered.map(
  (item) => [

    new Date(
      item.tanggal
    ).toLocaleDateString(
      "id-ID"
    ),

    (
      item.saldoAwal || 0
    ).toLocaleString(
      "id-ID"
    ),

    (
      item.belanja || 0
    ).toLocaleString(
      "id-ID"
    ),

        (
          item.cashbon || 0
        ).toLocaleString(
          "id-ID"
        ),

        (
          item.lainnya || 0
        ).toLocaleString(
          "id-ID"
        ),

        (
          item.markup || 0
        ).toLocaleString(
          "id-ID"
        ),

        (
          item.saldoAkhir || 0
        ).toLocaleString(
          "id-ID"
        ),

        (
          item.cash || 0
        ).toLocaleString(
          "id-ID"
        ),

        (
          (item.belanja || 0) +
          (item.cashbon || 0) +
          (item.lainnya || 0) +
          (item.markup || 0)
        ).toLocaleString(
          "id-ID"
        ),

      ]
    ),
  });

  const finalY =
    (doc as any)
      .lastAutoTable
      .finalY || 120;

  doc.setFontSize(11);

  doc.text(
    "Catatan Bulanan:",
    14,
    finalY + 10
  );

  let yPos =
    finalY + 18;

filtered.forEach(
  (item, dataIndex) => {

    if (!item.keterangan)
      return;

    if (yPos > 260) {
      doc.addPage();

      yPos = 20;
    }

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      `${dataIndex + 1}. ${item.tanggal}`,
      14,
      yPos
    );

    yPos += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    const catatan =
      item.keterangan
        .split("\n")
        .filter(
          (line) =>
            line.trim()
        );

    catatan.forEach(
      (line, index) => {

        const cleanText =
          line.replace(
            /^\d+\.\s*/,
            ""
          );

        const wrappedText =
          doc.splitTextToSize(
            cleanText,
            155
          );

        if (
          yPos +
            wrappedText.length *
              7 >
          280
        ) {

          doc.addPage();

          yPos = 20;
        }

        doc.text(
          `${index + 1}.`,
          18,
          yPos
        );

        doc.text(
          wrappedText,
          28,
          yPos
        );

        yPos +=
          wrappedText.length * 7;

      }
    );

    yPos += 6;

  }
);

  doc.save(
    "laporan-bulanan.pdf"
  );
};

const exportExcel = () => {

  const excelData = data.map(
    (item) => ({

      Tanggal: new Date(
        item.tanggal
      ).toLocaleDateString(
        "id-ID"
      ),

      "Saldo Awal":
        item.saldoAwal || 0,

      Belanja:
        item.belanja || 0,

      Cashbon:
        item.cashbon || 0,

      Lainnya:
        item.lainnya || 0,

      Markup:
        item.markup || 0,

      "Saldo Akhir":
        item.saldoAkhir || 0,

      "Dalam Rekening":
        item.cash || 0,

      Total:
        (item.belanja || 0) +
        (item.cashbon || 0) +
        (item.lainnya || 0) +
        (item.markup || 0),

      Keterangan:
        item.keterangan || "",

    })
  );

  excelData.push({
    Tanggal: "",
    "Saldo Awal": 0,
    Belanja: 0,
    Cashbon: 0,
    Lainnya: 0,
    Markup: 0,
    "Saldo Akhir": 0,
    "Dalam Rekening": 0,
    Total: 0,
    Keterangan: "",
  });

  excelData.push({
    Tanggal: "TOTAL BELANJA",
    "Saldo Awal": 0,
    Belanja: totalBelanja,
    Cashbon: 0,
    Lainnya: 0,
    Markup: 0,
    "Saldo Akhir": 0,
    "Dalam Rekening": 0,
    Total: 0,
    Keterangan: "",
  });

  excelData.push({
    Tanggal: "SUBTOTAL CASHBON",
    "Saldo Awal": 0,
    Belanja: 0,
    Cashbon: subtotalCashbon,
    Lainnya: 0,
    Markup: 0,
    "Saldo Akhir": 0,
    "Dalam Rekening": 0,
    Total: 0,
    Keterangan: "",
  });

  excelData.push({
    Tanggal: "SUBTOTAL LAINNYA",
    "Saldo Awal": 0,
    Belanja: 0,
    Cashbon: 0,
    Lainnya: data.reduce(
      (a, b) =>
        a + (b.lainnya || 0),
      0
    ),
    Markup: 0,
    "Saldo Akhir": 0,
    "Dalam Rekening": 0,
    Total: 0,
    Keterangan: "",
  });

  excelData.push({
    Tanggal: "GRAND TOTAL",
    "Saldo Awal": 0,
    Belanja: 0,
    Cashbon: 0,
    Lainnya: 0,
    Markup: 0,
    "Saldo Akhir": 0,
    "Dalam Rekening": 0,
    Total: grandTotal,
    Keterangan: "",
  });

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );

  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 50 },
  ];

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Laporan"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const fileData =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/octet-stream",
      }
    );

  saveAs(
    fileData,
    "laporan-keuangan.xlsx"
  );

};

const exportJSON = () => {

  const backupData = {
    version: "2.0",

    exportedAt:
      new Date().toISOString(),

    transaksi: data,

    logo,
  };

  const dataStr =
    JSON.stringify(
      backupData,
      null,
      2
    );

  const blob =
    new Blob(
      [dataStr],
      {
        type:
          "application/json",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    `backup-rekap-${
      new Date()
        .toLocaleDateString(
          "id-ID"
        )
        .replaceAll("/", "-")
    }.json`;

  link.click();

  URL.revokeObjectURL(
    url
  );

  alert(
    "Backup berhasil dibuat"
  );

};

const importJSON = (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file =
    e.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = (
    event
  ) => {

    try {

      const result =
        event.target?.result;

      if (
        typeof result !==
        "string"
      ) {

        alert(
          "File tidak valid"
        );

        return;
      }

      const parsed =
        JSON.parse(
          result
        );

      if (
        !parsed.transaksi ||
        !Array.isArray(
          parsed.transaksi
        )
      ) {

        alert(
          "Format backup salah"
        );

        return;
      }

      setData(
        parsed.transaksi
      );

      if (parsed.logo) {

        setLogo(
          parsed.logo
        );

      }

      alert(
        "Backup berhasil dipulihkan"
      );

    } catch {

      alert(
        "File backup rusak atau tidak valid"
      );

    }

  };

  reader.readAsText(
    file
  );

};

const resetSemuaData = () => {

  const konfirmasi = confirm(
    "Yakin ingin menghapus semua data?"
  );

  if (!konfirmasi) return;

  setData([]);

  setLogo("");

  setEditingData(null);

  setSelectedCatatanId(null);

  setCatatanEdit("");

  localStorage.removeItem(
    "rekap-keuangan"
  );

  localStorage.removeItem(
    "company-logo"
  );

  alert(
    "Semua data berhasil dihapus"
  );

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
        subtotalLainnya={
          data.reduce(
            (a, b) =>
              a + (b.lainnya || 0),
            0
          )
        }
        grandTotal={grandTotal}
      />

        <div className="bg-amber-100 p-5 rounded-xl shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-4">

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

          <button
            onClick={resetSemuaData}
            className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Reset Data
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

           <button
            onClick={() => {

              if (data.length === 0) {

                alert(
                  "Belum ada data transaksi"
                );

                return;
              }

              const transaksiTerakhir =
                data[data.length - 1];

              setSelectedCatatanId(
                transaksiTerakhir.id
              );

              setCatatanEdit(
                transaksiTerakhir.keterangan || ""
              );

            }}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600"
          >
            Edit Catatan
          </button>

          
          </div>
            {selectedCatatanId && (

              <div className="bg-white p-4 rounded-lg shadow mb-4 text-black">

                <h2 className="font-bold text-lg mb-3">
                  Edit Catatan
                </h2>

                <textarea
                  className="w-full border rounded p-3 min-h-45"
                  value={catatanEdit}
                  onChange={(e) =>
                    setCatatanEdit(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan catatan..."
                />

                <div className="flex gap-3 mt-3">

                  <button
                    onClick={updateCatatan}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Simpan Catatan
                  </button>

                  <button
                    onClick={() => {

                      setSelectedCatatanId(
                        null
                      );

                      setCatatanEdit("");

                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Batal
                  </button>

                </div>

              </div>

            )}
          

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
