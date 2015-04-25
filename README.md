# Solitaire
HTML5 Solitaire engine with data-driven rule sets


## Rules format
Rules are defined as JSON, with two main sections, layout and rules.
Required attributes are identified by a dash (-) in the default column

### layout

##### cards (object)
The deck of cards that the game will be dealt from.

| property | type   | default |
|----------|--------|:-------:|
| cardType | string |    -    |
| count    | int    |    1    |

Valid cardTypes: standard-deck

##### piles (array)
Piles on the table that the player can interact with.

| property | type   | default |
|----------|--------|:-------:|
| id       | string |    -    |
| pileType | string |    -    |
| count    | int    |    1    |

pileTypes are defined in the rules.pileTypes object.

### rules

Describes rules that determine when cards can be grabbed from piles and dropped
to piles, as well as triggers that are activated after certain events.

##### pileTypes (object)
Dictionary of pileType name->pileType object.

##### pileType object

Defines the behavior of a pileType.

| property | type         |          default         |
|----------|--------------|:------------------------:|
| maxSize  | int          | Number.POSITIVE_INFINITY |
| setup    | array/string |             -            |
| grab     | Rule/Boolean Expression |         undefined        |
| drop     | Rule/Boolean Expression |         undefined        |
| activate | array(Rule-Action pair) |       undefined       |
| triggers | Triggers     |         undefined        |

If a rule is undefined, the action can always be performed.


##### Triggers

Defines any triggers that might occur after some event.

| property   | type        | default |
|------------|-------------|:-------:|
| onGrab     | array(Rule-Action pair) | undefined |
| onDropFrom | array(Rule-Action pair) | undefined |
| onDropOnto | array(Rule-Action pair) | undefined |

onGrab occurs immediately after a successful grab from this pile
onDropFrom occurs immediately after a successful drop from this pile into another pile
onDropOnto occurs immediately after a successful drop onto this pile from another pile

##### Rule-Action pair

| property | type   | default |
|----------|--------|:-------:|
| rule     | Rule/Boolean Expression   |    -    |
| action   | Action                    |    -    |

If rule is omitted, the action can always be performed.

##### Rule

| property  | type      | default |
|-----------|-----------|:-------:|
| target    | Target    |    -    |
| condition | Condition |    -    |

##### Boolean Expression
Boolean expressions can contain rules or other boolean expressions.
They are evaluated recursively.

| property     | type             | default |
|--------------|------------------|:-------:|
| AND          | array(Rule)/Boolean Expression | undefined |
| OR           | array(Rule)/Boolean Expression | undefined |

Either AND or OR must be defined.

##### Target
A Target refers to a card or pile. A Target can be a string, which uses the string
as the id and the default values for all other attributes.

| property | type     | default |
|----------|----------|:-------:|
| id       | string   |    -    |
| idType   | string   |   "id"  |
| selector | Selector |  "this" |

valid ids: grabTarget, dropTarget, activateTarget, held, pile, [pileId]
valid idTypes: id, [pileType]

##### Selector
A selector defines a single card/pile or a collection or range of cards/piles.
A selector can be a string, which uses the string as the id and default values
for all other attributes.

| property | type     | default |
|----------|----------|:-------:|
| id       | string   |    -    |
| count    | int      |    1    |

Valid selectorIds: pos[int], pos+[int], pos-[int], top, bot, top[int], bot[int], all

##### Condition
A Condition checks the state of a card or pile against a given value or 1 or more
other cards or piles, selected with the target attribute.

| property  | type     | default |
|-----------|----------|:-------:|
| attribute | string   |    -    |
| relation  | string   |    -    |
| value     | string   |    -    |
| target    | Target   | undefined |

Valid pile attributes: count
Valid card attributes: suit, color, rank, facing, position

Valid relations (where applicable): =, !=, <, >

Valid values (where applicable): red, black, hearts, diamonds, clubs, spades,
[int] (e.g. 2), top, bot, alt, same, +[int] (e.g. -1), -[int] (e.g. +2)

alt, same, +[int] and -[int] require the target attribute. +/-[int] is used for a value relative to the target, (e.g. -1 could mean one rank lower)


##### Action

An action the game should make. Usually used on triggers or pile actives.
Argument count and type is based on the command.

| property  | type                  | default |
|-----------|-----------------------|:-------:|
| command   | string                |     -     |
| target    | Target                | undefined |
| arguments | object/array(objects) | undefined |
