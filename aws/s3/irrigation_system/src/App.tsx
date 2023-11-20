import React, { useEffect, useState } from 'react';
import server from "./server";
import "./App.css"

interface iConfig {
  id: String,
  itemType: String,
  irrigate: boolean,
  thresholdMin: number,
  thresholdMax: number
}

interface iHist{
  umidade: number,
  irrigando: boolean
}

const MyTable: React.FC<any> = () => {
  const [editIrrigar, setEditIrrigar] = useState(false);
  const [editUmidadeMin, setEditUmidadeMin] = useState(0);
  const [editUmidadeMax, setEditUmidadeMax] = useState(0);
  const [config, setConfig] = useState<iConfig>();
  const [loading, setLoading] = useState(true);
  const [hists, setHist] = useState<iHist[]>([]);
  const [_, setLoadingH] = useState(true);
  
  const configNodeMCU = async() => {
    try {
      const result = await server.get('/config/send')

      console.log(result);

      if (result.data.hasOwnProperty("error")) {
        return alert(result.data.error)
      }
      
      console.log(result.data)
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (loading) {
      server.get('/config')
        .then((response) => {
          console.log(response);
          setConfig(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    }
  }, [loading]);

  useEffect(() => {
      server.get('/read')
        .then((response) => {
          console.log(response);
          setHist(response.data);
          setLoadingH(false);
        })
        .catch((error) => {
          console.log(error);
          setLoadingH(false);
        });
        
        const intervalId = setInterval(() => {
          server.get('/read')
        .then((response) => {
          console.log(response);
          setHist(response.data);
          setLoadingH(false);
        })
        .catch((error) => {
          console.log(error);
          setLoadingH(false);
        });
        }, 2000);

        return () => clearInterval(intervalId);
      }, []);

  const handleSubmit = async (event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const result = await server.patch('/config/update',      
      {
        irrigate: data.get("irrigar") === "on",
      thresholdMin: Number(data.get("umidadeMin")),
      thresholdMax: Number(data.get("umidadeMax")),
      })

      console.log(result);

      if (result.data.hasOwnProperty("error")) {
        return alert(result.data.error)
      }
      
      console.log(result.data)
      //alert("Cadastro efetuado com sucesso!")
      window.location.href = "/";
      
      configNodeMCU();
    } catch (error) {
      console.error(error);
      alert("Erro ao efetuar cadastro: " + error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case 'irrigar':
        setEditIrrigar(!editIrrigar);
        break;
      case 'umidadeMin':
        setEditUmidadeMin(Number(value));
        break;
      case 'umidadeMax':
        setEditUmidadeMax(Number(value));
        break;
      default:
        break;
    }
  };

  return (
    <div className='wrapper'>
      <h1>Sistema de Irrigação Autônoma</h1>
      <div className='container'>
        <h3>Configuração</h3>
        <form onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Irrigar</th>
                <th>Umidade Min</th>
                <th>Umidade Max</th>
              </tr>
            </thead>
            <tbody>
            <tr>
                <td><input type='checkbox' checked={config?.irrigate} disabled /></td>
                <td>{config?.thresholdMin}</td>
                <td>{config?.thresholdMax}</td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    name="irrigar"
                    checked={editIrrigar}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="umidadeMin"
                    value={editUmidadeMin}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="umidadeMax"
                    value={editUmidadeMax}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <button>Enviar</button>
        </form>
        <h3>Histórico de Umidade</h3>
        <table>
        <thead>
          <tr>
            <th>Umidade</th>
            <th>Irrigando</th>
          </tr>
        </thead>
        <tbody>
          {
            hists.slice().reverse().map((hist) => (
              <tr>
                <td>{`${(hist?.umidade)?.toFixed(2)}%`}</td>
                <td><input type='checkbox' checked={hist?.irrigando} disabled /></td>
              </tr>))
          }
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default MyTable;
