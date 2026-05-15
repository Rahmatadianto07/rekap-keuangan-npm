"use client";

import {
  FaTrash,
  FaEdit,
  FaPrint,
} from "react-icons/fa";

import { Transaksi } from "@/types/transaksi";
import { rupiah } from "@/utils/rupiah";

interface Props {
  data: Transaksi[];

  onDelete: (id: number) => void;

  onEdit: (
    item: Transaksi
  ) => void;

  onPrint: (
    item: Transaksi
  ) => void;
}

export default function RekapTable({
  data,
  onDelete,
  onEdit,
  onPrint,
}: Props) {

  const subtotalBelanja =
    data.reduce(
      (a, b) =>
        a + (b.belanja || 0),
      0
    );

  const subtotalCashbon =
    data.reduce(
      (a, b) =>
        a + (b.cashbon || 0),
      0
    );

  const subtotalLainnya =
    data.reduce(
      (a, b) =>
        a + (b.lainnya || 0),
      0
    );

  const subtotalMarkup =
    data.reduce(
      (a, b) =>
        a + (b.markup || 0),
      0
    );

  const subtotalSaldoAkhir =
    data.reduce(
      (a, b) =>
        a + (b.saldoAkhir || 0),
      0
    );

  const totalCash =
    data.reduce(
      (a, b) =>
        a + (b.cash || 0),
      0
    );

  const grandTotal =
    subtotalBelanja +
    subtotalCashbon +
    subtotalLainnya +
    subtotalMarkup;

  return (
    <div className="overflow-x-auto">

      <table className="w-full border text-sm text-black">

        <thead>
          <tr className="bg-green-600">

            <th className="border p-2">
              NO
            </th>

            <th className="border p-2">
              TANGGAL
            </th>

            <th className="border p-2">
              SALDO AWAL
            </th>

            <th className="border p-2">
              BELANJA
            </th>

            <th className="border p-2">
              CASHBON
            </th>

            <th className="border p-2">
              LAINNYA
            </th>

            <th className="border p-2">
              MARKUP
            </th>

            <th className="border p-2">
              SALDO AKHIR
            </th>

            <th className="border p-2">
              DALAM REKENING
            </th>

            <th className="border p-2">
              AKSI
            </th>

          </tr>
        </thead>

        <tbody>

          {data.map(
            (item, index) => (
              <tr key={item.id}>

                <td className="border p-2 text-center">
                  {index + 1}
                </td>

                <td className="border p-2">
                  {item.tanggal}
                </td>

                <td className="border p-2">
                  {rupiah(
                    item.saldoAwal || 0
                  )}
                </td>

                <td className="border p-2 text-red-600">
                  {rupiah(
                    item.belanja || 0
                  )}
                </td>

                <td className="border p-2">
                  {rupiah(
                    item.cashbon || 0
                  )}
                </td>

                <td className="border p-2">
                  {rupiah(
                    item.lainnya || 0
                  )}
                </td>

                <td className="border p-2">
                  {rupiah(
                    item.markup || 0
                  )}
                </td>

                <td className="border p-2 font-bold">
                  {rupiah(
                    item.saldoAkhir || 0
                  )}
                </td>

                <td className="border p-2">
                  {rupiah(
                    item.cash || 0
                  )}
                </td>

                <td className="border p-2">

                  <div className="flex items-center justify-center gap-3">

                    <button
                      onClick={() =>
                        onPrint(item)
                      }
                      className="text-green-700"
                    >
                      <FaPrint />
                    </button>

                    <button
                      onClick={() =>
                        onEdit(item)
                      }
                      className="text-blue-600"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() =>
                        onDelete(
                          item.id
                        )
                      }
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </td>

              </tr>
            )
          )}

          <tr className="bg-blue-500 font-bold">

            <td
              colSpan={3}
              className="border p-2 text-center"
            >
              SUBTOTAL
            </td>

            <td className="border p-2">
              {rupiah(
                subtotalBelanja
              )}
            </td>

            <td className="border p-2">
              {rupiah(
                subtotalCashbon
              )}
            </td>

            <td className="border p-2">
              {rupiah(
                subtotalLainnya
              )}
            </td>

            <td className="border p-2">
              {rupiah(
                subtotalMarkup
              )}
            </td>

            <td className="border p-2">
              {rupiah(
                subtotalSaldoAkhir
              )}
            </td>

            <td className="border p-2">
              {rupiah(totalCash)}
            </td>

            <td className="border p-2"></td>

          </tr>

          <tr className="bg-yellow-300 font-bold">

            <td
              colSpan={7}
              className="border p-2 text-center"
            >
              GRAND TOTAL PENGELUARAN
            </td>

            <td
              colSpan={3}
              className="border p-2 text-center text-red-700"
            >
              {rupiah(
                grandTotal
              )}
            </td>

          </tr>

        </tbody>
      </table>
      
      <div className="mt-4 bg-gray-100 border rounded p-4 text-red-700">

        <h2 className="font-bold text-lg mb-3 ">
          Catatan Keterangan
        </h2>

        {data.filter(
          (item) => item.keterangan
        ).length === 0 && (
          <p className="text-gray-500">
            Tidak ada catatan
          </p>
        )}

        {data.map((item, index) => (

          item.keterangan ? (

            <div
              key={item.id}
              className="mb-2 border-b pb-2"
            >

              <p className="font-semibold">
                {index + 1}.{" "}
                {item.tanggal}
              </p>

              <div className="text-sm text-gray-700">
                
              {item.keterangan
                .split("\n")
                .map((line, i) => (

                  <div
                    key={i}
                    className="mb-1"
                  >
                    {line}
                  </div>

                ))}
            </div>

            </div>

          ) : null

        ))}

      </div>
    </div>
  );
}
