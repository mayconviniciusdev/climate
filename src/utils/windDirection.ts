// tabela de direções
const CARDINALS = [
  { min: 0, max: 22.5, label: 'N' },
  { min: 22.5, max: 67.5, label: 'NE' },
  { min: 67.5, max: 112.5, label: 'E' },
  { min: 112.5, max: 157.5, label: 'SE' },
  { min: 157.5, max: 202.5, label: 'S' },
  { min: 202.5, max: 247.5, label: 'SO' },
  { min: 247.5, max: 292.5, label: 'O' },
  { min: 292.5, max: 337.5, label: 'NO' },
  { min: 337.5, max: 360, label: 'N' },
]

// função para descobrir a direção cardinal
export function getWindDirectionCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360 // garante que o valor fique sempre entre 0 e 359 graus

  // procura na tabela a fatia onde o grau se encaixa
  const direction = CARDINALS.find((item) => {
    // se o grau for igual ou maior que 337.5, sabemos que é ('N')
    if (item.min === 337.5 && normalized >= 337.5) {return true}
    // para as outras direções, verifica se o valor está entre o mínimo e o máximo da fatia
    return normalized >= item.min && normalized < item.max
  })

  // retorna a sigla encontrada, assumindo 'N' por padrão.
  return direction?.label ?? 'N'
}

// função que cria o texto final
export function formatWindDirection(degrees: number): string {
  const cardinal = getWindDirectionCardinal(degrees) // pega a letra correspondente usando a função anterior
  return `${Math.round(degrees)}° (${cardinal})` // arredonda o número e monta o texto final no formato: "46° (NE)"
}