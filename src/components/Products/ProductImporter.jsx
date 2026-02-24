import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, Check, AlertTriangle, FileSpreadsheet, Loader2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ProductImporter({ onSuccess, onClose }) {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = async (file) => {
        setLoading(true);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                validateData(jsonData);
                setPreviewData(jsonData);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                setErrors(['Erro ao ler arquivo Excel. Verifique o formato.']);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const validateData = (data) => {
        const newErrors = [];
        if (!data || data.length === 0) {
            newErrors.push('Arquivo vazio ou sem dados na primeira aba.');
        }

        const requiredColumns = ['Nome', 'Preco']; // Map to your needs. 'Name' validation in backend too.

        // Simple validation of first row to check format
        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            // Check essential mapping keys exist in some form (case insensitive)
            // Ideally should guide user with a template
        }

        // Row by row validation
        data.forEach((row, index) => {
            if (!row.Nome && !row.name) { // Adapt to pt-br likely column headers
                newErrors.push(`Linha ${index + 2}: Nome do produto é obrigatório.`);
            }
        });

        if (newErrors.length > 0) {
            setErrors(newErrors);
        }
    };

    const mapDataToSchema = (data) => {
        return data.map(row => ({
            name: row['Nome'] || row['nome'] || row['Name'] || row['name'],
            category: row['Categoria'] || row['categoria'] || row['Category'] || row['category'],
            price: row['Preço'] || row['Preco'] || row['preço'] || row['preco'] || row['Price'] || row['price'] || 0,
            cost: row['Custo'] || row['custo'] || row['Cost'] || row['cost'] || 0,
            stock: row['Estoque'] || row['estoque'] || row['Stock'] || row['stock'] || 0,
            variation_name: row['Variacao'] || row['Variação'] || row['variacao'] || 'Único'
        })).filter(item => item.name); // Filter empty rows
    };

    const handleImport = async () => {
        if (errors.length > 0 && !confirm('Existem erros no arquivo. Deseja tentar importar apenas as linhas válidas?')) {
            return;
        }

        setLoading(true);
        try {
            const mappedData = mapDataToSchema(previewData);

            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ products: mappedData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro na importação');
            }

            const result = await response.json();

            toast.success(
                `Importação concluída! 
                Inseridos: ${result.inserted}, 
                Atualizados: ${result.updated}, 
                Falhas: ${result.failed}`,
                { duration: 5000 }
            );

            if (result.errors && result.errors.length > 0) {
                console.error("Import errors:", result.errors);
                // Optionally show detailed error modal
            }

            onSuccess();
            onClose();

        } catch (error) {
            console.error('Import error:', error);
            toast.error(`Erro ao importar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" />
                        Importar Produtos via Excel
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Upload size={48} className="text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-700">Clique para selecionar arquivo</h4>
                        <p className="text-sm text-gray-500 mt-2">Suporta arquivos .xlsx</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        <div className="mt-8 text-xs text-gray-400 text-center">
                            <p className="font-bold mb-1">Colunas esperadas:</p>
                            <p>Nome, Categoria, Preco, Custo, Estoque</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="text-green-600" size={20} />
                                <span className="font-medium text-sm">{file.name}</span>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Remover
                            </button>
                        </div>

                        {/* Errors - Show first few */}
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-4 text-sm text-red-700 max-h-32 overflow-y-auto">
                                <p className="font-bold mb-1 flex items-center gap-1">
                                    <AlertTriangle size={14} /> Erros encontrados:
                                </p>
                                <ul className="list-disc pl-4 space-y-1">
                                    {errors.slice(0, 5).map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                    {errors.length > 5 && <li>...e mais {errors.length - 5} erros</li>}
                                </ul>
                            </div>
                        )}

                        {/* Preview Table */}
                        <div className="flex-1 overflow-auto border rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                                    <tr>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Categoria</th>
                                        <th className="p-3">Preço</th>
                                        <th className="p-3">Estoque</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewData.slice(0, 50).map((row, i) => {
                                        const name = row['Nome'] || row['nome'] || row['Name'] || row['name'];
                                        const price = row['Preço'] || row['Preco'] || row['preço'] || row['preco'] || row['Price'] || row['price'];
                                        const stock = row['Estoque'] || row['estoque'] || row['Stock'] || row['stock'];
                                        const hasError = !name;

                                        return (
                                            <tr key={i} className={hasError ? 'bg-red-50/50' : ''}>
                                                <td className="p-3 font-medium">{name || <span className="text-red-400 italic">Ausente</span>}</td>
                                                <td className="p-3 text-gray-500">{row['Categoria'] || row['categoria'] || '-'}</td>
                                                <td className="p-3">R$ {Number(price || 0).toFixed(2)}</td>

                                                <td className="p-3">{stock || 0}</td>
                                                <td className="p-3">
                                                    {hasError ? <X size={16} className="text-red-500" /> : <Check size={16} className="text-green-500" />}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {previewData.length === 0 && !loading && (
                                <p className="text-center py-8 text-gray-400">Nenhum dado encontrado</p>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                            Exibindo preview das primeiras 50 linhas. Total: {previewData.length}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    {file && (
                        <button
                            onClick={handleImport}
                            disabled={loading || (previewData.length === 0 && errors.length > 0)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-soft hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Importando...' : 'Confirmar Importação'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
