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
        data.forEach((row, index) => {
            if (!row.Nome && !row.name) {
                newErrors.push(`Linha ${index + 2}: Nome do produto é obrigatório.`);
            }
        });
        if (newErrors.length > 0) setErrors(newErrors);
    };

    const mapDataToSchema = (data) => {
        return data.map(row => ({
            name: row['Nome'] || row['nome'] || row['Name'] || row['name'],
            category: row['Categoria'] || row['categoria'] || row['Category'] || row['category'],
            price: row['Preço'] || row['Preco'] || row['preço'] || row['preco'] || row['Price'] || row['price'] || 0,
            cost: row['Custo'] || row['custo'] || row['Cost'] || row['cost'] || 0,
            stock: row['Estoque'] || row['estoque'] || row['Stock'] || row['stock'] || 0,
            variation_name: row['Variacao'] || row['Variação'] || row['variacao'] || 'Único'
        })).filter(item => item.name);
    };

    const handleImport = async () => {
        if (errors.length > 0 && !confirm('Existem erros no arquivo. Deseja tentar importar apenas as linhas válidas?')) return;

        setLoading(true);
        try {
            const mappedData = mapDataToSchema(previewData);
            if (mappedData.length === 0) throw new Error('Nenhum produto válido encontrado no arquivo. Verifique se a coluna "Nome" está preenchida.');

            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshData.session) throw new Error('Sessão expirada. Faça login novamente e tente de novo.');

            const { data: responseData, error: invokeError } = await supabase.functions.invoke('import-products', {
                body: { products: mappedData }
            });

            if (invokeError) {
                let message = invokeError.message || 'Erro na importação';
                if (message.includes('PRO plan') || message.includes('pro')) {
                    message = 'Esta funcionalidade é exclusiva do plano PRO. Faça upgrade para importar produtos em lote.';
                }
                throw new Error(message);
            }

            toast.success(
                `Importação concluída! Inseridos: ${responseData.inserted}, Atualizados: ${responseData.updated}, Falhas: ${responseData.failed}`,
                { duration: 5000 }
            );

            if (responseData.errors?.length > 0) console.error("Import errors:", responseData.errors);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-4xl rounded-3xl p-6 shadow-soft border border-border animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="text-success" size={22} />
                        Importar Produtos via Excel
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drop zone */}
                {!file ? (
                    <div
                        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/40 rounded-2xl p-12 bg-muted/50 hover:bg-accent/30 transition-colors cursor-pointer group"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                            <Upload size={28} className="text-primary" />
                        </div>
                        <h4 className="text-base font-semibold text-foreground">Clique para selecionar arquivo</h4>
                        <p className="text-sm text-muted-foreground mt-1">Suporta arquivos .xlsx</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        <div className="mt-8 text-xs text-muted-foreground/70 text-center bg-muted rounded-xl px-5 py-3 border border-border">
                            <p className="font-bold mb-1 text-muted-foreground">Colunas esperadas:</p>
                            <p>Nome · Categoria · Preco · Custo · Estoque</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">

                        {/* File info bar */}
                        <div className="flex items-center justify-between mb-4 bg-muted/60 border border-border px-4 py-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="text-success flex-shrink-0" size={18} />
                                <span className="font-medium text-sm text-foreground truncate">{file.name}</span>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-xs text-destructive hover:underline flex-shrink-0 ml-3"
                            >
                                Remover
                            </button>
                        </div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl mb-4 text-sm text-destructive max-h-32 overflow-y-auto">
                                <p className="font-bold mb-1 flex items-center gap-1">
                                    <AlertTriangle size={14} /> Erros encontrados:
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-destructive/80">
                                    {errors.slice(0, 5).map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                    {errors.length > 5 && <li>...e mais {errors.length - 5} erros</li>}
                                </ul>
                            </div>
                        )}

                        {/* Preview Table */}
                        <div className="flex-1 overflow-auto border border-border rounded-2xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted sticky top-0 border-b border-border">
                                    <tr>
                                        {['Nome', 'Categoria', 'Preço', 'Estoque', 'Status'].map(col => (
                                            <th key={col} className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {previewData.slice(0, 50).map((row, i) => {
                                        const name = row['Nome'] || row['nome'] || row['Name'] || row['name'];
                                        const price = row['Preço'] || row['Preco'] || row['preço'] || row['preco'] || row['Price'] || row['price'];
                                        const stock = row['Estoque'] || row['estoque'] || row['Stock'] || row['stock'];
                                        const hasError = !name;

                                        return (
                                            <tr key={i} className={`transition-colors ${hasError ? 'bg-destructive/5' : 'hover:bg-muted/50'}`}>
                                                <td className="p-3 font-medium text-foreground">
                                                    {name || <span className="text-destructive italic text-xs">Ausente</span>}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {row['Categoria'] || row['categoria'] || '—'}
                                                </td>
                                                <td className="p-3 text-foreground">
                                                    R$ {Number(price || 0).toFixed(2)}
                                                </td>
                                                <td className="p-3 text-foreground">
                                                    {stock || 0}
                                                </td>
                                                <td className="p-3">
                                                    {hasError
                                                        ? <span className="inline-flex items-center gap-1 text-destructive text-xs font-medium"><X size={14} /> Erro</span>
                                                        : <span className="inline-flex items-center gap-1 text-success text-xs font-medium"><Check size={14} /> OK</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {previewData.length === 0 && !loading && (
                                <p className="text-center py-8 text-muted-foreground text-sm">Nenhum dado encontrado</p>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground/60 mt-2 text-right">
                            Exibindo preview das primeiras 50 linhas. Total: {previewData.length}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-medium transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    {file && (
                        <button
                            onClick={handleImport}
                            disabled={loading || (previewData.length === 0 && errors.length > 0)}
                            className="bg-success text-success-foreground px-6 py-2 rounded-xl font-bold shadow-soft hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Importando...' : 'Confirmar Importação'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}