--
-- PostgreSQL database dump
--

-- Dumped from database version 13.6 (Ubuntu 13.6-1.pgdg20.04+1)
-- Dumped by pg_dump version 14.2 (Ubuntu 14.2-1.pgdg20.04+1+b1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activemeetings; Type: TABLE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE TABLE public.activemeetings (
    id character varying(200),
    name character(40),
    public boolean
);


ALTER TABLE public.activemeetings OWNER TO wwiwookhmzbgif;

--
-- Name: blog; Type: TABLE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE TABLE public.blog (
    blogid integer NOT NULL,
    title character varying(100) NOT NULL,
    summary text,
    content text NOT NULL,
    published_at timestamp with time zone,
    filepath text,
    filekey text,
    updated_at timestamp with time zone
);


ALTER TABLE public.blog OWNER TO wwiwookhmzbgif;

--
-- Name: blog_blogid_seq; Type: SEQUENCE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE SEQUENCE public.blog_blogid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blog_blogid_seq OWNER TO wwiwookhmzbgif;

--
-- Name: blog_blogid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wwiwookhmzbgif
--

ALTER SEQUENCE public.blog_blogid_seq OWNED BY public.blog.blogid;


--
-- Name: transaction; Type: TABLE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE TABLE public.transaction (
    name character varying(75),
    email character varying(75),
    amount double precision,
    created_at timestamp with time zone
);


ALTER TABLE public.transaction OWNER TO wwiwookhmzbgif;

--
-- Name: usr; Type: TABLE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE TABLE public.usr (
    fname character varying(20),
    lname character varying(30),
    email character varying(100),
    password character varying(20),
    admin boolean,
    is_verified boolean
);


ALTER TABLE public.usr OWNER TO wwiwookhmzbgif;

--
-- Name: video; Type: TABLE; Schema: public; Owner: wwiwookhmzbgif
--

CREATE TABLE public.video (
    title character varying(100),
    description text,
    tag character varying(75),
    uploaded_at timestamp with time zone,
    filepath text,
    filekey text,
    url text,
    updated_at timestamp with time zone
);


ALTER TABLE public.video OWNER TO wwiwookhmzbgif;

--
-- Name: blog blogid; Type: DEFAULT; Schema: public; Owner: wwiwookhmzbgif
--

ALTER TABLE ONLY public.blog ALTER COLUMN blogid SET DEFAULT nextval('public.blog_blogid_seq'::regclass);


--
-- Data for Name: activemeetings; Type: TABLE DATA; Schema: public; Owner: wwiwookhmzbgif
--

COPY public.activemeetings (id, name, public) FROM stdin;
\.


--
-- Data for Name: blog; Type: TABLE DATA; Schema: public; Owner: wwiwookhmzbgif
--

COPY public.blog (blogid, title, summary, content, published_at, filepath, filekey, updated_at) FROM stdin;
130	Church Blog 	<p>blog summary</p>	<p>blog content</p>	2022-04-07 18:27:45+00	https://church276-blog.s3.amazonaws.com/1b99e112-b991-4ea7-93b6-f8d77301b18b.jpg	1b99e112-b991-4ea7-93b6-f8d77301b18b.jpg	2022-04-07 18:28:32+00
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: wwiwookhmzbgif
--

COPY public.transaction (name, email, amount, created_at) FROM stdin;
John Doe	sb-hwcxg15545859@personal.example.com	25	2022-04-03 21:10:55+00
anonymous	anonymous	1.2	2022-04-03 21:11:38+00
anonymous	anonymous	100	2022-04-04 15:10:22+00
anonymous	anonymous	0.62	2022-04-04 22:21:49+00
anonymous	anonymous	25	2022-04-06 03:40:28+00
anonymous	anonymous	100	2022-04-06 03:48:11+00
anonymous	anonymous	25	2022-04-06 20:51:54+00
anonymous	anonymous	25	2022-04-06 20:54:33+00
John Doe	sb-r7dk315512175@personal.example.com	50	2022-04-06 20:55:13+00
\.


--
-- Data for Name: usr; Type: TABLE DATA; Schema: public; Owner: wwiwookhmzbgif
--

COPY public.usr (fname, lname, email, password, admin, is_verified) FROM stdin;
Ca	Cu	ca@mail.com	password	f	\N
Peter	Park	peterpark@gmail.com	peterpark	t	\N
ta1cmpt	sfu	tasfu@sfu.ca	12345678	f	\N
tes	ter	tester@gmail.com	testing1	f	\N
vanneAdmin	kyle	vannekyle6@gmail.com	testemail2	t	\N
\.


--
-- Data for Name: video; Type: TABLE DATA; Schema: public; Owner: wwiwookhmzbgif
--

COPY public.video (title, description, tag, uploaded_at, filepath, filekey, url, updated_at) FROM stdin;
Church	Youtube Video - Church Prayers		2022-04-06 05:51:16+00	undefined	undefined	https://www.youtube.com/embed/aih2gh734vw	\N
\.


--
-- Name: blog_blogid_seq; Type: SEQUENCE SET; Schema: public; Owner: wwiwookhmzbgif
--

SELECT pg_catalog.setval('public.blog_blogid_seq', 133, true);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: wwiwookhmzbgif
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO wwiwookhmzbgif;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: LANGUAGE plpgsql; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON LANGUAGE plpgsql TO wwiwookhmzbgif;


--
-- PostgreSQL database dump complete
--

