export default function CardStat({ title, amount }) {
  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h3 className="text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold">{amount}</p>
    </div>
  );
}
