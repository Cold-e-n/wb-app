<?php

namespace App\Helpers;

use App\Models\Kain;
use App\Models\PosisiWarna;


/**
 *
 */
class PerhitunganWarna
{
    /**
     *
     */
    protected Kain $kain;

    /**
     *
     */
    protected PosisiWarna $posisiWarna;

    /**
     *
     */
    protected $warna;

    /**
     *
     */
    protected array $result;

    /**
     *
     */
    public function __construct(Kain $kain, PosisiWarna $posisiWarna)
    {
        $this->kain = $kain;
        $this->posisiWarna = $posisiWarna;
        $this->warna = json_decode($kain->colour->type, true);
        $this->result = array_fill(1, $this->posisiWarna->seksi, []);
    }

    /**
     * Menentukan posisi pertama.
     */
    public function firstPos()
    {
        extract($this->warna);

        $n = (int) floor(
            (($this->posisiWarna->cones * $this->posisiWarna->seksi) - (
                ($distance * ($total - 1)) + $total
            )) / 2
        );

        return $n;
    }

    /**
     * Posisi berikutnya di seksi yang sama.
     */
    public function nextPosCurrentSect(array $current)
    {
        $n = $this->posisiWarna->cones - array_sum($current) - count($current);

        return $n;
    }

    /**
     * Posisi seksi pertama.
     */
    public function firstPosFirstSect(array $current)
    {
        extract($this->warna);
        $n = $this->firstPos();
        $i = 1;

        $current[0] = $n;

        foreach ($current as $key => $value)
        {
            $i = $this->nextPosCurrentSect($current);

            while($i > $distance)
            {
                $current[] = $distance;
                (($i - $distance) == 1) ? $i = null : $i = $this->nextPosCurrentSect($current);
            }

            $current[] = $i;
        }

        return $current;
    }

    /**
     * Posisi pertama seksi berikutnya.
     */
    public function posNextSect(array $current)
    {
        extract($this->warna);

        $result = [];
        $n = $distance - end($current);
        $result[0] = $n;

        foreach ($result as $key => $value)
        {
            $i = $this->nextPosCurrentSect($result);

            while($i > $distance)
            {
                $result[] = $distance;
                (($i - $distance) == 1) ? $i = null : $i = $this->nextPosCurrentSect($result);
            }

            $result[] = $i;
        }

        return $result;
    }

    /**
     * Posisi seksi terakhir jika ada benang warna di OUT.
     */
    public function lastSect(array $current)
    {
        extract($this->warna);

        $result = [];
        $n = $distance - end($current);
        $result[0] = $n;

        if (array_key_exists('out', $this->warna))
        {
            $i = array_fill(0, $out['total'], 10);
            $result[] = $this->nextPosCurrentSect($result) - count($i) - (count($i) * 10);

            foreach ($i as $value)
            {
                $result[] = $value;
            }
        } else {
            $result[] = $this->nextPosCurrentSect($current);
        }

        return $result;
    }

    /**
     *
     * @return array
     */
    public function hitung()
    {
        foreach($this->result as $keys => $values)
        {
            if ($keys == 1)
            {
                $this->result[$keys] = $this->firstPosFirstSect($this->result[1]);
            } else {
                if (array_key_exists('out', $this->warna) && ($keys == $this->posisiWarna->seksi))
                {
                    $this->result[$keys] = $this->lastSect($this->result[$keys - 1]);
                } else {
                    $this->result[$keys] = $this->posNextSect($this->result[$keys - 1]);
                }
            }
        }

        return $this->result;
    }

}
