interface Props {
  totalBelanja: number;
  subtotalCashbon: number;
  subtotalLainnya: number;
  grandTotal: number;
}

export default function SummaryCard({
  totalBelanja,
  subtotalCashbon,
  subtotalLainnya,
  grandTotal,
}: Props) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-5">

      <div className="bg-red-500 text-black p-5 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">
          Total Belanja
        </h2>

        <p className="text-2xl font-bold">
          Rp
          {totalBelanja.toLocaleString(
            "id-ID"
          )}
        </p>
      </div>

      <div className="bg-blue-500 text-black p-5 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">
          Subtotal Cashbon
        </h2>

        <p className="text-2xl font-bold">
          Rp
          {subtotalCashbon.toLocaleString(
            "id-ID"
          )}
        </p>
      </div>

      <div className="bg-green-500 text-black p-5 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">
          Subtotal Lainnya
        </h2>

        <p className="text-2xl font-bold">
          Rp
          {subtotalLainnya.toLocaleString(
            "id-ID"
          )}
        </p>
      </div>

      <div className="bg-yellow-400 text-black p-5 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">
          Grand Total
        </h2>

        <p className="text-2xl font-bold">
          Rp
          {grandTotal.toLocaleString(
            "id-ID"
          )}
        </p>
      </div>

    </div>
  );
}
