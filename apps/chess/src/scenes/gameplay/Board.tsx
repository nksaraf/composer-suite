import { GroupProps, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useStore } from "statery"
import { DEFAULT_POSITION } from "~/lib/chess/constants"
import { Color, PieceSymbol, State } from "~/lib/chess/types"
import { store } from "~/state"
import {
  algebraic,
  Chess,
  file,
  rank,
  Square as SquareType,
  squareColor,
  SQUARES
} from "../../lib/chess"
import {
  generateMoves,
  getPiece,
  loadFen,
  makeMove,
  makePretty,
  sanToMove
} from "../../lib/chess/state"
import { gameplayStore } from "./state"
// import { getGame } from '~/lib/game'
// import { Select } from '../modules/solid-postprocessing'
// import { T } from 'solid-three'
// import { Piece } from './Piece'
// import { Square } from './Square'
// import { createControls } from 'solid-leva'
// import ShipPage from '~/routes/fleet'
// import { Model } from './Ship'
// import { ModernPiece } from './ModernPiece'
// import { useTheatre } from "./theatre";

// export function makeChessMove(availableMove) {
//   getGame().chessBoard = makeMove(getGame().chessBoard, availableMove)
// }

export type BoardProps = {
  squareComponent: React.FC<SquareProps>
  pieceComponent: React.FC<PieceProps>
  squareSize: number
}

export type PieceProps = {
  square: SquareType
  piece: PieceSymbol
  color: Color
} & MeshProps

export type SquareProps = {
  square: SquareType
  size: number
} & MeshProps

export function useChessSquare({
  square
}: // makeMove
{
  square: SquareType
  // makeMove?: boolean
}) {
  const { board, selectedSquare } = useStore(gameplayStore)
  const moves = generatePrettyMoves(board, selectedSquare)
  const piece = getPiece(board, square)
  const availableMove = moves.find((m) => m.to === square)

  const isMovable = availableMove ? true : false

  const turn = board.turn

  const isSelectable = piece ? piece.color === turn : false
  const isKilling = isMovable && piece && piece.color !== turn
  const isSelected = selectedSquare === square

  return {
    isSelectable,
    isKilling,
    isMovable,
    availableMove,
    isSelected,
    isSquareHovered: false,
    turn,
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (isMovable) {
        gameplayStore.set({
          board: makeMove(board, sanToMove(board, availableMove!.san)!)
        })
      }
      if (piece?.color === turn) {
        gameplayStore.set({ selectedSquare: square })
      }
      e.stopPropagation()
    }
  }
}

export const BoardSquare = (
  props: {
    square: SquareType
  } & BoardProps
) => {
  let index = SQUARES[props.square as SquareType]
  // const gameApp = getGame()

  // const controls = ("board", {
  //   offset: props.offset ?? [0, 0],
  //   xSquareSize: { value: props.squareSize, step: 0.1 },
  //   ySquareSize: { value: props.squareSize, step: 0.1 }
  // })

  const controls = {
    offset: [-8.5, -8.5],
    xSquareSize: 2.5,
    ySquareSize: 2.5
  }

  let y = rank(index)
  let x = file(index)
  const { board } = useStore(gameplayStore)

  const piece = getPiece(board, props.square)

  const SquareComponent = props.squareComponent
  const PieceComponent = props.pieceComponent

  return (
    <>
      <SquareComponent
        square={algebraic(index)}
        size={props.squareSize}
        // makeChessMove={(move: ReturnType<typeof sanToMove>) => {
        //   props.onMove?.(move)
        // }}
        position={[
          x * controls.xSquareSize + controls.offset[0],
          -1,
          y * controls.ySquareSize + controls.offset[1]
        ]}
      />
      {/* <T
        position={[
          x * controls.xSquareSize + controls.offset[0],
          0,
          y * controls.ySquareSize + controls.offset[1]
        ]}
      ></T> */}
      {piece && (
        <PieceComponent
          position={[
            x * controls.xSquareSize + controls.offset[0],
            0,
            y * controls.ySquareSize + controls.offset[1]
          ]}
          square={props.square}
          piece={piece?.type}
          color={piece?.color}
        />
      )}
      {/* <Show when={piece() !== null}>
        <Suspense>
          <Select enabled={getGame().selectedSquare === algebraic(index)}>
            <Dynamic
              component={props.pieceComponent}

            />
          </Select>
        </Suspense>
      </Show> */}
    </>
  )
}

function generatePrettyMoves(board: State, square: SquareType | "none") {
  if (square === "none") return []
  let moves = generateMoves(board, { square })
  return moves.map((move) => makePretty(board, move))
}

export function Board(props: BoardProps) {
  // const [pieces, setPieces] = createSignal(
  //   Object.fromEntries(
  //     Object.keys(SQUARES)
  //       .map((s) => [s, getPiece(getGame().chessBoard, s)])
  //       .filter((x) => x[1])
  //   )
  // )

  // let refs = {}
  // let oldState = pieces()

  return (
    <group>
      {Object.keys(SQUARES).map((square) => (
        <BoardSquare
          squareSize={props.squareSize ?? 2.5}
          squareComponent={props.squareComponent}
          pieceComponent={props.pieceComponent}
          square={square as SquareType}
          // onMove={(move) => (oldState = props.onMove?.(move, refs, oldState))}
        />
      ))}
      {/* <For each={Object.keys(pieces())}>
        {(square) => (
          <Dynamic
            ref={(el) => (refs[square] = el)}
            component={props.pieceComponent}
            position={[
              file(SQUARES[square]) * props.squareSize ?? 2.5,
              2,
              rank(SQUARES[square]) * props.squareSize ?? 2.5
            ]}
            userData={{ piece: pieces()[square] }}
            square={square as SquareType}
            piece={pieces()[square]?.type}
            color={pieces()[square]?.color}
          />
        )}
      </For> */}
    </group>
  )
}
