import '../styles/Dashboard.css';
import ImageLayout from '../components/ImageLayout';
import InfoCard from "../components/InfoCard";

let listItems = [
    "Cards editáveis (Dashboard) - Botões de Guardar, Editar e Eliminar",
    "Chat Backend e Ligação Frontend",
    "Menu User/Icon Pessoa - Logout + Editar",
    "Página Editar - User CRUD + patch password",
    "Footer",
    "Responsividade",
    "Páginas de Erros (Opcional)",
    "Adicionar funcionalidades (Calendário, packing list, Weather, Bilhetes já comprados)",
    "Aprimorar parte visual / corrigir erros de layout"
];

export default function ToDoList() {
    return (
        <ImageLayout bgImageClass="bg-landing">
            <InfoCard>
                <h5>To-Do List</h5>
                <ul style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: '500', color: '#0b395a', textAlign: 'left', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                    {listItems.map((item, index) => (
                        <li key={index} style={{ fontSize: '1.4rem', lineHeight: '2.5rem' }}>{item}</li>
                    ))}
                </ul>
            </InfoCard>
        </ImageLayout>
    ) 
}
