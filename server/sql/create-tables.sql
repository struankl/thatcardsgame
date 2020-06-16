create table game
(
    id   BIGSERIAL NOT NULL primary key,
    uuid UUID      NOT NULL unique
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table player
(
    id   bigserial not null primary key,
    name varchar(50)
);

create table game_player
(
    game   BIGINT references game (id)   not null,
    player BIGINT references player (id) not null,
    score  INT default 0                 not null,
    answer float8                        not null,
    cards  INT[]
);

create table white_cards_played
(
    game BIGINT references game (id) not null,
    card int references white_cards (id)
);

create table black_cards_played
(
    game BIGINT references game (id) not null,
    card int references black_cards (id)
);

alter table game
    add current_black_card int references black_cards (id);
alter table game
    add game_state varchar(50) not null default 'waiting';
alter table game
    add round int not null default -1;

alter table player
    add uuid UUID not null unique default uuid_generate_v4();

create table round
(
    game   BIGINT references game (id)   not null,
    player BIGINT references player (id) not null,
    cards  int[]
);

create table websockets
(
    connection_id varchar(100) not null,
    player        BIGINT references player (id),
    game          BIGINT references game (id)
);
alter table round
    add winner boolean default false;

alter table round
    add rand double precision default random();

alter table game
    add czar Integer,
    add round_end timestamp;

ALTER TABLE game
    ALTER COLUMN czar TYPE bigint;

alter table game
    add name varchar(250),
    add cardsets int [];

insert into card_set (id, active, base_deck, description, name, weight)
values (2400, true, false, 'Veterinarians', 'Veterinarians', 108);

insert into black_cards (id, draw, pick, text, watermark)
values
(581, 0, 1, 'So, I was removing a foreign body and out popped ____', 'vet'),
(582, 0, 1, 'No Dr. Vet I don’t know where the dog could got the ____ from!', 'vet'),
(583, 0, 1, 'I’d rather ____ than see the client in room 3.', 'vet');

insert into white_cards (id, text, watermark)
values
(2623, 'Use my mouth to express anal glands', 'vet'),
(2624, 'Wear used cow rectal gloves to the ball', 'vet'),
(2625, 'Clean a cat bite abscess out with my tongue', 'vet'),
(2626, 'The smell of anal glands in the afternoon', 'vet'),
(2627, 'Cat pee in your face', 'vet');

insert into card_set_black_card (card_set_id, black_card_id)
values
(2400, 581),
(2400, 582),
(2400, 583);

insert into card_set_white_card (card_set_id, white_card_id)
values
(2400, 2623),
(2400, 2624),
(2400, 2625),
(2400, 2626),
(2400, 2627);

create table house_rules
(
    id int primary key,
    name varchar(250),
    description varchar
);

alter table game add column rules int[] default '{}'::int[]

insert into house_rules (id, name, description) values
(1, 'Rando Cardrissian', 'A virtual player known as ''Rando Cardrissian'', plays a randomn card in each round. If he wins the game, all players go home in a state of everlasting shame.');

insert into house_rules (id, name, description) VALUES
(2, 'Meritocracy', ' Instead of passing clockwise, the role of Card Czar passes to the winner of the previous round.');

insert into player (id, name) values (-1, 'Rando Cardrissian');

alter table game
add column last_round_start timestamp default now();

alter table game
add column game_start timestamp,
add column end_state jsonb default '{}';
--------------------------------------------
