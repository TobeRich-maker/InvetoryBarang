<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kode_barang',
        'barcode',
        'nama_barang',
        'kategori',
        'stok',
        'harga',
        'satuan',
    ];

    /**
     * Get the logs for the barang.
     */
    public function logs()
    {
        return $this->hasMany(LogBarang::class);
    }
}
