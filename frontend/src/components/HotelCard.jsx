import { getReserves } from "../api";
import { useQuery } from '@tanstack/react-query'
import "../styles/HotelCard.css";

export default function HotelCard() {
console.log("Hotel Card")

// useQuery vai buscar TODAS as reservas à API
  const { data: allReserves = [], isLoading, isError } = useQuery({
    queryKey: ['reserves'], // chave simples - busca tudo
    queryFn: getReserves,
  })

  let first_reserve = allReserves[0]
 
  return (
    <div className="card-wrapper">
      <div className="hotel-card">
        <div className="card-header">
          <h2>HOTEL</h2>
          <span className="icon">✈</span>
        </div>

        <p className="subtitle">{first_reserve.check_in_date}, Country</p>
        <p className="subtitle">City, Country</p>
        <p className="description">{first_reserve.check_in_date}</p>
        <p className="description">Check-in Date</p>
        <p className="description">Check-out Date</p>

        <button className="select-btn">
          Update
        </button>

      </div>

      <button className="select-btn">
          Add +
        </button>
    </div>
  );
}