import { useState, useEffect } from "react";
import { fetchSpellTable } from "../../../utils/dbFuncs";

interface SpellTableProps {
    spellIndex: string;
    hasTable: boolean;
}

const SpellTable: React.FC<SpellTableProps> = ({ spellIndex, hasTable }) => {
    const [spellTableData, setSpellTableData] = useState<JSON | null>(null);

    // Fetch spell table data when component mounts or spell changes
    useEffect(() => {
        const fetchTableData = async () => {
            if (hasTable) {
                try {
                    const data = await fetchSpellTable(spellIndex);
                    setSpellTableData(data || null);
                } catch (error) {
                    console.error('Error fetching spell table data:', error);
                    setSpellTableData(null);
                }
            } else {
                setSpellTableData(null);
            }
        };

        fetchTableData();
    }, [spellIndex, hasTable]);

    if (!hasTable || !spellTableData) {
        return null;
    }

    return (
        <div style={{ margin: '16px 0' }}>
            <table style={{ 
                borderCollapse: 'collapse', 
                width: '100%',
                border: '1px solid #ccc'
            }}>
                <thead>
                    <tr>
                        {Object.keys(spellTableData as any).map(header => (
                            <th key={header} style={{ 
                                border: '1px solid #ccc',
                                padding: '8px',
                                backgroundColor: '#f5f5f5',
                                textAlign: 'left',
                                textTransform: 'capitalize'
                            }}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: Math.max(...Object.values(spellTableData as any).map((arr: any) => arr?.length || 0)) }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.values(spellTableData as any).map((column: any, colIndex) => (
                                <td key={colIndex} style={{ 
                                    border: '1px solid #ccc',
                                    padding: '8px'
                                }}>
                                    {column?.[rowIndex] || ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SpellTable;