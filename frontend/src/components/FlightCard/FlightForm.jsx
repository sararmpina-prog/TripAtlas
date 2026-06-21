import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../../styles/FlightCard.css';

export default function FlightForm({ outboundSegments = [], returnSegments = [], onSave, onCancel, isPending }) {
    // 💡 O SEU SELETOR ORIGINAL: Controla qual a aba visível ('Outbound' ou 'Return')
    const [direction, setDirection] = useState('Outbound');

    // 💡 TRATAMENTO DOS ARRAYS SEPARADOS: Evita o crash de índices e perda de foco
    const [outbound, setOutbound] = useState([...outboundSegments]);
    const [returns, setReturns] = useState([...returnSegments]);

    // Calcula o próximo número de ordem com base no array correto (a sua lógica original)
    const nextOrder = direction === 'Outbound' ? outbound.length + 1 : returns.length + 1;

    // Função universal para atualizar os campos de texto de um input específico
    const handleFieldChange = (list, setList, index, field, value) => {
        const updatedList = [...list];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setList(updatedList);
    };

    // 🚀 ADICIONAR VOO: Agora funciona na hora porque empurra para o array correto
    const handleAddSegment = () => {
        const newFlight = {
            id: null, // O MySQL gera automaticamente
            flight_number: '',
            airline: '',
            departure_airport: '',
            arrival_airport: '',
            departure_datetime: '',
            arrival_datetime: '',
            direction: direction.toLowerCase() // Guarda 'outbound' ou 'return' para a base de dados
        };

        if (direction === 'Outbound') {
            setOutbound([...outbound, newFlight]);
        } else {
            setReturns([...returns, newFlight]);
        }
    };

    // Remover um voo da listagem
    const handleRemoveSegment = (index, type) => {
        if (type === 'Outbound') {
            setOutbound(outbound.filter((_, i) => i !== index));
        } else {
            setReturns(returns.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Unifica os dois arrays limpos para enviar tudo ao index.jsx
        onSave([...outbound, ...returns]);
    };

    // Define qual a lista ativa no ecrã com base no seu botão de direção
    const activeList = direction === 'Outbound' ? outbound : returns;
    const setActiveList = direction === 'Outbound' ? setOutbound : setReturns;

    return (
        <form onSubmit={handleSubmit} className="flight-form-container">
            <h4 style={{ color: 'var(--text-heading-dark)', marginBottom: '1.2rem' }}>Manage Flights</h4>

            {/* 💡 OS SEUS BOTÕES SELETORES ORIGINAIS */}
            <div className="journey-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    type="button"
                    className={`btn-base ${direction === 'Outbound' ? 'active btn-orange' : ''}`}
                    onClick={() => setDirection('Outbound')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '600' }}
                >
                    Outbound ({outbound.length})
                </button>

                <button
                    type="button"
                    className={`btn-base ${direction === 'Return' ? 'active btn-orange' : ''}`}
                    onClick={() => setDirection('Return')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '600' }}
                >
                    Return ({returns.length})
                </button>
            </div>

            {/* LISTAGEM REATIVA DOS CARTÕES DE INPUTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeList.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
                        No {direction.toLowerCase()} segments logged yet.
                    </p>
                ) : (
                    activeList.map((flight, index) => (
                        <div key={index} className="flight-form-segment-card" style={{ background: '#fcfcfc', border: '1px solid var(--border-light)', padding: '1.2rem', borderRadius: '16px', position: 'relative' }}>
                            
                            {/* Botão de Apagar Voo */}
                            <button 
                                type="button" 
                                onClick={() => handleRemoveSegment(index, direction)} 
                                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                            >
                                <FaTrash size={14} />
                            </button>

                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {direction} Flight #{index + 1}
                            </span>
                            
                            {/* Linha 1: Número do Voo e Linha Aérea */}
                            <div className="flight-form-grid-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input type="text" placeholder="Flight No. (ex: TP102)" value={flight.flight_number || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'flight_number', e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                                <input type="text" placeholder="Airline (ex: TAP)" value={flight.airline || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'airline', e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                            </div>

                            {/* Linha 2: Aeroportos e Horários */}
                            <div className="flight-form-grid-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input type="text" placeholder="From" maxLength={3} value={flight.departure_airport || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'departure_airport', e.target.value.toUpperCase())} required style={{ flex: 0.4, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }} />
                                <input type="text" placeholder="To" maxLength={3} value={flight.arrival_airport || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'arrival_airport', e.target.value.toUpperCase())} required style={{ flex: 0.4, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }} />
                                
                                <input type="datetime-local" value={flight.departure_datetime ? flight.departure_datetime.slice(0, 16) : ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'departure_datetime', e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                                <input type="datetime-local" value={flight.arrival_datetime ? flight.arrival_datetime.slice(0, 16) : ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'arrival_datetime', e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 💡 BOTÃO DINÂMICO USANDO O SEU NEXTORDER */}
            <button 
                type="button" 
                className="btn-base" 
                onClick={handleAddSegment}
                style={{ width: '100%', padding: '0.6rem', border: '1px dashed var(--color-orange)', background: '#fff9f5', color: 'var(--color-orange)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
                <FaPlus size={12} /> Add {direction} Flight (Segment #{nextOrder})
            </button>

            {/* SUBMISSÃO */}
            <div className="flight-form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-base btn-orange" disabled={isPending}>
                    {isPending ? 'Syncing Flights...' : 'Save Flight Configuration'}
                </button>
                <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
